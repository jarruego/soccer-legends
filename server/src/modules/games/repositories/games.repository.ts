/**
 * Repositorio de Games (Partidas)
 *
 * Centraliza toda la lógica de acceso a datos de partidas y jugadores
 */

import { Injectable } from '@nestjs/common';
import { db } from '@/database/db';
import { games, gamePlayers, users, type Game, type GamePlayer } from '@/database/schema';
import { eq, and, or } from 'drizzle-orm';

@Injectable()
export class GamesRepository {
  /**
   * Crea una nueva partida
   */
  async create(gameData: {
    createdBy: string;
    name: string;
    pin: string;
    description?: string;
    initialBalance: number;
    maxPlayers: number;
    maxTransfer?: number;
    seasonalCollection?: number;
    location?: string;
    hasCommonFund?: boolean;
  }): Promise<Game> {
    const result = await db
      .insert(games)
      .values({
        createdBy: gameData.createdBy,
        name: gameData.name,
        pin: gameData.pin,
        description: gameData.description || null,
        initialBalance: gameData.initialBalance.toString(),
        maxPlayers: gameData.maxPlayers,
        maxTransfer: gameData.maxTransfer ?? 500,
        seasonalCollection: gameData.seasonalCollection ?? 30,
        location: gameData.location || null,
        hasCommonFund: gameData.hasCommonFund ?? true,
        status: 'pending',
      })
      .returning();

    return result[0];
  }

  /**
   * Obtiene una partida por su ID
   */
  async findById(id: string): Promise<Game | null> {
    const result = await db.query.games.findFirst({
      where: eq(games.id, id),
    });

    return result || null;
  }

  /**
   * Obtiene una partida por su PIN
   */
  async findByPin(pin: string): Promise<Game | null> {
    const result = await db.query.games.findFirst({
      where: eq(games.pin, pin),
    });

    return result || null;
  }

  /**
   * Obtiene todas las partidas del usuario (creadas o en las que participa)
   */
  async findByUser(userId: string): Promise<Game[]> {
    const userCreatedGames = await db.query.games.findMany({
      where: eq(games.createdBy, userId),
    });

    const userJoinedGames = await db.query.gamePlayers.findMany({
      where: eq(gamePlayers.userId, userId),
    });

    const gameIds = new Set([
      ...userCreatedGames.map((g) => g.id),
      ...userJoinedGames.map((gp) => gp.gameId),
    ]);

    if (gameIds.size === 0) {
      return [];
    }

    const allGames = await db.query.games.findMany({
      where: (games, { inArray }) => inArray(games.id, Array.from(gameIds)),
      orderBy: (games, { desc }) => [desc(games.createdAt)],
    });

    return allGames;
  }

  /**
   * Obtiene todas las partidas creadas por el usuario
   */
  async findByCreator(userId: string): Promise<Game[]> {
    return db.query.games.findMany({
      where: eq(games.createdBy, userId),
      orderBy: (games, { desc }) => [desc(games.createdAt)],
    });
  }

  /**
   * Obtiene partidas activas o pendientes
   */
  async findActive(): Promise<Game[]> {
    return db.query.games.findMany({
      where: (games, { inArray }) => inArray(games.status, ['pending', 'active']),
    });
  }

  /**
   * Actualiza una partida
   */
  async update(
    id: string,
    updateData: {
      name?: string;
      description?: string;
      status?: string;
      location?: string;
    },
  ): Promise<Game | null> {
    const result = await db.update(games).set(updateData).where(eq(games.id, id)).returning();

    return result[0] || null;
  }

  /**
   * Elimina una partida
   */
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(games).where(eq(games.id, id)).returning();
    return result.length > 0;
  }

  /**
   * Obtiene el número de jugadores en una partida
   */
  async countPlayers(gameId: string): Promise<number> {
    const result = await db
      .select()
      .from(gamePlayers)
      .where(eq(gamePlayers.gameId, gameId));

    return result.length;
  }

  /**
   * Verifica si un usuario ya está en una partida
   */
  async isPlayerInGame(gameId: string, userId: string): Promise<boolean> {
    const result = await db.query.gamePlayers.findFirst({
      where: and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, userId)),
    });

    return result !== undefined;
  }

  /**
   * Agrega un jugador a una partida
   */
  async addPlayer(
    gameId: string,
    userId: string,
    initialBalance: number,
  ): Promise<GamePlayer> {
    const result = await db
      .insert(gamePlayers)
      .values({
        gameId,
        userId,
        currentBalance: initialBalance.toString(),
      })
      .returning();

    return result[0];
  }

  /**
   * Obtiene los jugadores de una partida con sus datos
   */
  async getPlayersWithData(gameId: string): Promise<
    Array<{
      gameId: string;
      userId: string;
      username: string;
      avatar: string | null;
      currentBalance: string;
      createdAt: Date;
    }>
  > {
    return db
      .select({
        gameId: gamePlayers.gameId,
        userId: gamePlayers.userId,
        username: users.username,
        avatar: users.avatar,
        currentBalance: gamePlayers.currentBalance,
        createdAt: gamePlayers.createdAt,
      })
      .from(gamePlayers)
      .innerJoin(users, eq(gamePlayers.userId, users.id))
      .where(eq(gamePlayers.gameId, gameId))
      .orderBy(gamePlayers.createdAt);
  }

  /**
   * Obtiene un jugador específico de una partida
   */
  async getPlayer(gameId: string, userId: string): Promise<GamePlayer | null> {
    const result = await db.query.gamePlayers.findFirst({
      where: and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, userId)),
    });

    return result || null;
  }

  /**
   * Actualiza el balance de un jugador
   */
  async updatePlayerBalance(gameId: string, userId: string, newBalance: number): Promise<GamePlayer | null> {
    const result = await db
      .update(gamePlayers)
      .set({
        currentBalance: newBalance.toString(),
      })
      .where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, userId)))
      .returning();

    return result[0] || null;
  }

  /**
   * Obtiene el balance actual de un jugador
   */
  async getPlayerBalance(gameId: string, userId: string): Promise<number | null> {
    const result = await db.query.gamePlayers.findFirst({
      where: and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, userId)),
    });

    return result ? parseFloat(result.currentBalance) : null;
  }

  /**
   * Elimina un jugador de una partida
   */
  async removePlayer(gameId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(gamePlayers)
      .where(and(eq(gamePlayers.gameId, gameId), eq(gamePlayers.userId, userId)))
      .returning();

    return result.length > 0;
  }
  /**
   * Elimina todas las partidas creadas por un usuario y sus gamePlayers
   */
  async deleteAllByCreator(userId: string): Promise<void> {
    const partidas = await this.findByCreator(userId);
    for (const partida of partidas) {
      await db.delete(gamePlayers).where(eq(gamePlayers.gameId, partida.id));
      await db.delete(games).where(eq(games.id, partida.id));
    }
  }

  /**
   * Elimina todas las participaciones de un usuario en partidas (gamePlayers)
   */
  async deleteAllParticipationsByUser(userId: string): Promise<void> {
    await db.delete(gamePlayers).where(eq(gamePlayers.userId, userId));
  }  
}
