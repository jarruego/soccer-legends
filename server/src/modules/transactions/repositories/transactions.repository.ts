/**
 * Repositorio de Transacciones
 *
 * Centraliza toda la lógica de acceso a datos de transacciones
 */

import { Injectable } from '@nestjs/common';
import { db } from '@/database/db';
import {
    transactions,
    users,
    commonFundClaims,
    seasonalCollectionClaims,
    type Transaction,
    type CommonFundClaim,
    type SeasonalCollectionClaim,
    CommonFundClaimStatus,
    SeasonalCollectionClaimStatus,
    TransactionType,
} from '@/database/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';
import { gte, lte, or } from 'drizzle-orm';

@Injectable()
export class TransactionsRepository {
    /**
     * Crea una nueva transacción
     */
    async create(transactionData: {
        gameId: string;
        fromUserId: string | null;
        toUserId: string | null;
        amount: number;
        type: TransactionType;
        description?: string;
    }): Promise<Transaction> {
        const result = await db
            .insert(transactions)
            .values({
                gameId: transactionData.gameId,
                fromUserId: transactionData.fromUserId,
                toUserId: transactionData.toUserId,
                amount: transactionData.amount.toString(),
                type: transactionData.type,
                description: transactionData.description || null,
            })
            .returning();

        return result[0];
    }

    /**
     * Obtiene una transacción por ID
     */
    async findById(id: string): Promise<Transaction | null> {
        const result = await db.query.transactions.findFirst({
            where: eq(transactions.id, id),
        });

        return result || null;
    }

    /**
     * Obtiene todas las transacciones de una partida
     */
    async findByGameId(gameId: string): Promise<Transaction[]> {
        return db.query.transactions.findMany({
            where: eq(transactions.gameId, gameId),
            orderBy: desc(transactions.createdAt),
        });
    }

    /**
     * Obtiene las transacciones de un usuario en una partida
     */
    async findByUserInGame(gameId: string, userId: string): Promise<Transaction[]> {
        return db
            .select()
            .from(transactions)
            .where(
                and(
                    eq(transactions.gameId, gameId),
                    eq(transactions.fromUserId, userId),
                ),
            )
            .orderBy(desc(transactions.createdAt))
            .union(
                db
                    .select()
                    .from(transactions)
                    .where(
                        and(
                            eq(transactions.gameId, gameId),
                            eq(transactions.toUserId, userId),
                        ),
                    )
                    .orderBy(desc(transactions.createdAt)),
            );
    }

    /**
     * Obtiene transacciones enviadas por un usuario
     */
    async findBySender(userId: string): Promise<Transaction[]> {
        return db.query.transactions.findMany({
            where: eq(transactions.fromUserId, userId),
            orderBy: desc(transactions.createdAt),
        });
    }

    /**
     * Obtiene transacciones recibidas por un usuario
     */
    async findByReceiver(userId: string): Promise<Transaction[]> {
        return db.query.transactions.findMany({
            where: eq(transactions.toUserId, userId),
            orderBy: desc(transactions.createdAt),
        });
    }

    /**
     * Obtiene el historial completo de una partida con datos de usuarios
     */
    async getGameTransactionHistory(gameId: string): Promise<
        Array<{
            id: string;
            gameId: string;
            fromUser: { id: string; username: string; avatar: string | null } | null;
            toUser: { id: string; username: string; avatar: string | null } | null;
            amount: string;
            type: string;
            description: string | null;
            createdAt: Date;
        }>
    > {
        // 1. Obtener todas las transacciones de la partida
        const rows = await db
            .select({
                id: transactions.id,
                gameId: transactions.gameId,
                fromUserId: transactions.fromUserId,
                toUserId: transactions.toUserId,
                amount: transactions.amount,
                type: transactions.type,
                description: transactions.description,
                createdAt: transactions.createdAt,
            })
            .from(transactions)
            .where(eq(transactions.gameId, gameId))
            .orderBy(desc(transactions.createdAt));

        // 2. Obtener todos los userIds únicos involucrados
        const userIds = Array.from(new Set(rows.flatMap(r => [r.fromUserId, r.toUserId]).filter((id): id is string => !!id)));
        let userMap: Record<string, { username: string; avatar: string | null }> = {};
        if (userIds.length) {
            const userRows = await db
                .select({ id: users.id, username: users.username, avatar: users.avatar })
                .from(users)
                .where(inArray(users.id, userIds));
            userRows.forEach(u => { userMap[u.id] = { username: u.username, avatar: u.avatar }; });
        }

        // 3. Mapear resultado con datos de usuario
        return rows.map(row => ({
            id: row.id,
            gameId: row.gameId,
            fromUser: row.fromUserId ? {
                id: row.fromUserId,
                username: userMap[row.fromUserId]?.username || '',
                avatar: userMap[row.fromUserId]?.avatar || null,
            } : null,
            toUser: row.toUserId ? {
                id: row.toUserId,
                username: userMap[row.toUserId]?.username || '',
                avatar: userMap[row.toUserId]?.avatar || null,
            } : null,
            amount: row.amount,
            type: row.type,
            description: row.description,
            createdAt: row.createdAt,
        }));
    }

    /**
     * Calcula el balance total de la banca en una partida
     * (suma de todas las transferencias a la banca menos retiradas)
     */
    async calculateBankBalance(gameId: string): Promise<number> {
        const result = await db
                .select()
                .from(transactions)
                .where(
                        and(
                                eq(transactions.gameId, gameId),
                                or(
                                        eq(transactions.type, TransactionType.PLAYER_TO_BANK),
                                        eq(transactions.type, TransactionType.BANK_TO_PLAYER),
                                ),
                        ),
                );

        let balance = 0;
        result.forEach((tx) => {
            const amount = parseFloat(tx.amount);
            if (tx.type === TransactionType.PLAYER_TO_BANK) {
                balance += amount; // Suma cuando entra a la banca
            } else if (tx.type === TransactionType.BANK_TO_PLAYER) {
                balance -= amount; // Resta cuando sale de la banca
            }
        });

        return balance;
    }

    /**
     * Calcula el balance total del Fondo Común en una partida
     */
    async calculateCommonFundBalance(gameId: string): Promise<number> {
        const result = await db
            .select()
            .from(transactions)
            .where(
                and(
                    eq(transactions.gameId, gameId),
                    or(
                        eq(transactions.type, TransactionType.PLAYER_TO_COMMON_FUND),
                        eq(transactions.type, TransactionType.COMMON_FUND_TO_PLAYER),
                    ),
                ),
            );

        return result.reduce((sum, tx) => {
            const amount = parseFloat(tx.amount);
            if (tx.type === TransactionType.PLAYER_TO_COMMON_FUND) {
                return sum + amount;
            }
            if (tx.type === TransactionType.COMMON_FUND_TO_PLAYER) {
                return sum - amount;
            }
            return sum;
        }, 0);
    }

    /**
     * Crea una solicitud para cobrar el Fondo Común
     */
    async createCommonFundClaim(gameId: string, requesterUserId: string): Promise<CommonFundClaim> {
        const result = await db
            .insert(commonFundClaims)
            .values({
                gameId,
                requesterUserId,
                status: CommonFundClaimStatus.PENDING,
            })
            .returning();

        return result[0];
    }

    /**
     * Obtiene una solicitud por ID
     */
    async findCommonFundClaimById(id: string): Promise<CommonFundClaim | null> {
        const result = await db.query.commonFundClaims.findFirst({
            where: eq(commonFundClaims.id, id),
        });

        return result || null;
    }

    /**
     * Obtiene la solicitud pendiente de una partida
     */
    async findPendingCommonFundClaimByGame(gameId: string): Promise<CommonFundClaim | null> {
        const result = await db.query.commonFundClaims.findFirst({
            where: and(
                eq(commonFundClaims.gameId, gameId),
                eq(commonFundClaims.status, CommonFundClaimStatus.PENDING),
            ),
            orderBy: desc(commonFundClaims.createdAt),
        });

        return result || null;
    }

    /**
     * Obtiene solicitudes pendientes de una partida con datos del usuario solicitante
     */
    async findPendingCommonFundClaimsWithUser(gameId: string): Promise<
        Array<{
            id: string;
            gameId: string;
            requesterUserId: string;
            requesterUsername: string;
            requesterAvatar: string | null;
            status: string;
            createdAt: Date;
        }>
    > {
        return db
            .select({
                id: commonFundClaims.id,
                gameId: commonFundClaims.gameId,
                requesterUserId: commonFundClaims.requesterUserId,
                requesterUsername: users.username,
                requesterAvatar: users.avatar,
                status: commonFundClaims.status,
                createdAt: commonFundClaims.createdAt,
            })
            .from(commonFundClaims)
            .innerJoin(users, eq(commonFundClaims.requesterUserId, users.id))
            .where(
                and(
                    eq(commonFundClaims.gameId, gameId),
                    eq(commonFundClaims.status, CommonFundClaimStatus.PENDING),
                ),
            )
            .orderBy(desc(commonFundClaims.createdAt));
    }

    /**
     * Obtiene la última solicitud de un usuario en una partida
     */
    async findLatestCommonFundClaimByRequester(
        gameId: string,
        requesterUserId: string,
    ): Promise<CommonFundClaim | null> {
        const result = await db.query.commonFundClaims.findFirst({
            where: and(
                eq(commonFundClaims.gameId, gameId),
                eq(commonFundClaims.requesterUserId, requesterUserId),
            ),
            orderBy: desc(commonFundClaims.createdAt),
        });

        return result || null;
    }

    /**
     * Actualiza el estado de una solicitud del Fondo Común
     */
    async resolveCommonFundClaim(
        claimId: string,
        status: CommonFundClaimStatus.APPROVED | CommonFundClaimStatus.REJECTED,
        resolvedByUserId: string,
    ): Promise<CommonFundClaim | null> {
        const result = await db
            .update(commonFundClaims)
            .set({
                status,
                resolvedByUserId,
                resolvedAt: new Date(),
            })
            .where(eq(commonFundClaims.id, claimId))
            .returning();

        return result[0] || null;
    }

    /**
     * Crea una solicitud de recaudacion por temporada
     */
    async createSeasonalCollectionClaim(
        gameId: string,
        requesterUserId: string,
        amount: number,
    ): Promise<SeasonalCollectionClaim> {
        const result = await db
            .insert(seasonalCollectionClaims)
            .values({
                gameId,
                requesterUserId,
                amount,
                status: SeasonalCollectionClaimStatus.PENDING,
            })
            .returning();

        return result[0];
    }

    /**
     * Obtiene una solicitud de recaudacion por temporada por ID
     */
    async findSeasonalCollectionClaimById(id: string): Promise<SeasonalCollectionClaim | null> {
        const result = await db.query.seasonalCollectionClaims.findFirst({
            where: eq(seasonalCollectionClaims.id, id),
        });

        return result || null;
    }

    /**
     * Obtiene solicitudes pendientes por partida con datos del usuario
     */
    async findPendingSeasonalCollectionClaimsWithUser(gameId: string): Promise<
        Array<{
            id: string;
            gameId: string;
            requesterUserId: string;
            requesterUsername: string;
            requesterAvatar: string | null;
            amount: number;
            status: string;
            createdAt: Date;
        }>
    > {
        return db
            .select({
                id: seasonalCollectionClaims.id,
                gameId: seasonalCollectionClaims.gameId,
                requesterUserId: seasonalCollectionClaims.requesterUserId,
                requesterUsername: users.username,
                requesterAvatar: users.avatar,
                amount: seasonalCollectionClaims.amount,
                status: seasonalCollectionClaims.status,
                createdAt: seasonalCollectionClaims.createdAt,
            })
            .from(seasonalCollectionClaims)
            .innerJoin(users, eq(seasonalCollectionClaims.requesterUserId, users.id))
            .where(
                and(
                    eq(seasonalCollectionClaims.gameId, gameId),
                    eq(seasonalCollectionClaims.status, SeasonalCollectionClaimStatus.PENDING),
                ),
            )
            .orderBy(desc(seasonalCollectionClaims.createdAt));
    }

    /**
     * Obtiene solicitud pendiente por solicitante en una partida
     */
    async findPendingSeasonalCollectionClaimByRequester(
        gameId: string,
        requesterUserId: string,
    ): Promise<SeasonalCollectionClaim | null> {
        const result = await db.query.seasonalCollectionClaims.findFirst({
            where: and(
                eq(seasonalCollectionClaims.gameId, gameId),
                eq(seasonalCollectionClaims.requesterUserId, requesterUserId),
                eq(seasonalCollectionClaims.status, SeasonalCollectionClaimStatus.PENDING),
            ),
            orderBy: desc(seasonalCollectionClaims.createdAt),
        });

        return result || null;
    }

    /**
     * Obtiene la ultima solicitud de recaudacion de un usuario en una partida
     */
    async findLatestSeasonalCollectionClaimByRequester(
        gameId: string,
        requesterUserId: string,
    ): Promise<SeasonalCollectionClaim | null> {
        const result = await db.query.seasonalCollectionClaims.findFirst({
            where: and(
                eq(seasonalCollectionClaims.gameId, gameId),
                eq(seasonalCollectionClaims.requesterUserId, requesterUserId),
            ),
            orderBy: desc(seasonalCollectionClaims.createdAt),
        });

        return result || null;
    }

    /**
     * Resuelve una solicitud de recaudacion por temporada
     */
    async resolveSeasonalCollectionClaim(
        claimId: string,
        status: SeasonalCollectionClaimStatus.APPROVED | SeasonalCollectionClaimStatus.REJECTED,
        resolvedByUserId: string,
    ): Promise<SeasonalCollectionClaim | null> {
        const result = await db
            .update(seasonalCollectionClaims)
            .set({
                status,
                resolvedByUserId,
                resolvedAt: new Date(),
            })
            .where(eq(seasonalCollectionClaims.id, claimId))
            .returning();

        return result[0] || null;
    }

    /**
     * Obtiene todas las transacciones entre dos fechas
     */
    async findByDateRange(gameId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
        return db
            .select()
            .from(transactions)
            .where(
                and(
                    eq(transactions.gameId, gameId),
                    and(
                        gte(transactions.createdAt, startDate),
                        lte(transactions.createdAt, endDate),
                    ),
                ),
            )
            .orderBy(desc(transactions.createdAt));
    }

    /**
     * Elimina una transacción (deshacer transacción)
     */
    async delete(id: string): Promise<boolean> {
        const result = await db.delete(transactions).where(eq(transactions.id, id)).returning();

        return result.length > 0;
    }
    
    /**
     * Obtiene todas las transacciones de un usuario (todas las partidas)
     */
    async findAllByUser(userId: string): Promise<any[]> {
        // 1. Obtener las transacciones
        const rows = await db
            .select({
                id: transactions.id,
                gameId: transactions.gameId,
                fromUserId: transactions.fromUserId,
                toUserId: transactions.toUserId,
                amount: transactions.amount,
                type: transactions.type,
                description: transactions.description,
                createdAt: transactions.createdAt,
            })
            .from(transactions)
            .where(or(eq(transactions.fromUserId, userId), eq(transactions.toUserId, userId)))
            .orderBy(desc(transactions.createdAt));

        // 2. Obtener todos los userIds únicos
        const userIds = Array.from(new Set(rows.flatMap(r => [r.fromUserId, r.toUserId]).filter((id): id is string => !!id)));
        const userMap: Record<string, string> = {};
        if (userIds.length) {
            const userRows = await db
                .select({ id: users.id, username: users.username })
                .from(users)
                .where(inArray(users.id, userIds));
            userRows.forEach(u => { userMap[u.id] = u.username; });
        }
        return rows.map(row => ({
            ...row,
            fromUsername: row.fromUserId ? userMap[row.fromUserId] : null,
            toUsername: row.toUserId ? userMap[row.toUserId] : null,
        }));
    }
    /**
     * Elimina todas las transacciones donde el usuario sea fromUserId o toUserId
     */
    async deleteAllByUser(userId: string): Promise<void> {
        await db.delete(transactions).where(or(eq(transactions.fromUserId, userId), eq(transactions.toUserId, userId)));
    }    
}

