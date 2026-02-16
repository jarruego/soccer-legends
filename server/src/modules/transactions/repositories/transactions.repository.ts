/**
 * Repositorio de Transacciones
 *
 * Centraliza toda la lógica de acceso a datos de transacciones
 */

import { Injectable } from '@nestjs/common';
import { db } from '@/database/db';
import { transactions, users, type Transaction, TransactionType } from '@/database/schema';
import { eq, and, desc } from 'drizzle-orm';
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
        return db
            .select({
                id: transactions.id,
                gameId: transactions.gameId,
                fromUserId: transactions.fromUserId,
                toUserId: transactions.toUserId,
                amount: transactions.amount,
                type: transactions.type,
                description: transactions.description,
                createdAt: transactions.createdAt,
                fromUsername: users.username,
                fromAvatar: users.avatar,
            })
            .from(transactions)
            .where(eq(transactions.gameId, gameId))
            .orderBy(desc(transactions.createdAt))
            .then((rows) => {
                return rows.map((row) => ({
                    id: row.id,
                    gameId: row.gameId,
                    fromUser: row.fromUserId
                        ? {
                                id: row.fromUserId,
                                username: row.fromUsername || '',
                                avatar: row.fromAvatar,
                            }
                        : null,
                    toUser: null, // Lo completo en el siguiente paso
                    amount: row.amount,
                    type: row.type,
                    description: row.description,
                    createdAt: row.createdAt,
                }));
            });
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
}

