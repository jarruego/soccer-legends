/**
 * Esquema de tabla GamePlayers (Jugadores en Partidas)
 *
 * Esta tabla es la tabla de unión (join table) entre usuarios y partidas.
 * Permite que un usuario participe en múltiples partidas.
 *
 * También almacena el balance actual de cada jugador en la partida,
 * que se actualiza con cada transacción.
 *
 * Relaciones:
 * - Un registro GamePlayer relaciona un usuario con una partida
 * - gameId -> games.id
 * - userId -> users.id
 */

import { pgTable, uuid, decimal, timestamp, foreignKey, primaryKey, index } from 'drizzle-orm/pg-core';
import { getTimestamps } from './types';
import { games } from './games';
import { users } from './users';

export const gamePlayers = pgTable(
  'game_players',
  {
    // ID de la partida a la que se une
    gameId: uuid('game_id').notNull(),

    // ID del usuario jugador
    userId: uuid('user_id').notNull(),

    // Balance actual del jugador en esta partida
    // Se actualiza automáticamente con cada transacción
    currentBalance: decimal('current_balance', { precision: 10, scale: 2 }).notNull().default('0.00'),

    // Posición del jugador en la partida (ej: "Portero", "Defensa", "Centrocampista", "Delantero")
    position: uuid('position'),

    // Timestamps
    ...getTimestamps(),
  },
  (table) => {
    return {
      // Clave primaria compuesta: cada usuario solo puede estar una vez por partida
      pk: primaryKey({
        columns: [table.gameId, table.userId],
        name: 'game_players_pkey',
      }),

      // Relaciones de clave externa
      gameIdFk: foreignKey({
        columns: [table.gameId],
        foreignColumns: [games.id],
        name: 'game_players_game_id_fk',
      })
        .onDelete('cascade'), // Si se elimina la partida, se eliminan los jugadores

      userIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: 'game_players_user_id_fk',
      })
        .onDelete('cascade'), // Si se elimina el usuario, se elimina su participación

      // Índices para búsquedas rápidas
      gameIdIdx: index('game_players_game_id_idx').on(table.gameId),
      userIdIdx: index('game_players_user_id_idx').on(table.userId),
    };
  },
);

export type GamePlayer = typeof gamePlayers.$inferSelect;
export type GamePlayerInsert = typeof gamePlayers.$inferInsert;
