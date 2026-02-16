/**
 * Esquema de tabla Transactions (Transacciones)
 *
 * Esta tabla registra todas las transferencias de dinero entre jugadores
 * y hacia/desde la banca.
 *
 * Una transacción puede ser:
 * 1. De jugador a jugador (fromUserId -> toUserId)
 * 2. De jugador a banca (toUserId = null, toBankBalance se incrementa)
 * 3. De banca a jugador (fromUserId = null, se decrementa bankBalance)
 *
 * Relaciones:
 * - gameId -> games.id (en qué partida ocurrió)
 * - fromUserId -> users.id (quién envía, puede ser null si es de la banca)
 * - toUserId -> users.id (quién recibe, puede ser null si es hacia la banca)
 */

import { pgTable, uuid, decimal, text, timestamp, foreignKey, varchar, index } from 'drizzle-orm/pg-core';
import { getTimestamps } from './types';
import { games } from './games';
import { users } from './users';

export const transactions = pgTable(
  'transactions',
  {
    // ID único de la transacción
    id: uuid('id').primaryKey().defaultRandom(),

    // ID de la partida donde ocurre la transacción
    gameId: uuid('game_id').notNull(),

    // ID del usuario que envía el dinero (null si es desde la banca)
    fromUserId: uuid('from_user_id'),

    // ID del usuario que recibe el dinero (null si es hacia la banca)
    toUserId: uuid('to_user_id'),

    // Cantidad de dinero transferida
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),

    // Descripción o motivo de la transacción (ej: "Pago a la banca", "Apuesta")
    description: text('description'),

    // Tipo de transacción para facilitar consultas
    // Valores: "player_to_player", "player_to_bank", "bank_to_player"
    type: varchar('type', { length: 30 }).notNull(),

    // Timestamps automáticos
    ...getTimestamps(),
  },
  (table) => {
    return {
      // Relaciones de clave externa
      gameIdFk: foreignKey({
        columns: [table.gameId],
        foreignColumns: [games.id],
        name: 'transactions_game_id_fk',
      })
        .onDelete('cascade'),

      fromUserIdFk: foreignKey({
        columns: [table.fromUserId],
        foreignColumns: [users.id],
        name: 'transactions_from_user_id_fk',
      })
        .onDelete('set null'),

      toUserIdFk: foreignKey({
        columns: [table.toUserId],
        foreignColumns: [users.id],
        name: 'transactions_to_user_id_fk',
      })
        .onDelete('set null'),

      // Índices para búsquedas rápidas
      gameIdIdx: index('transactions_game_id_idx').on(table.gameId),
      fromUserIdIdx: index('transactions_from_user_id_idx').on(table.fromUserId),
      toUserIdIdx: index('transactions_to_user_id_idx').on(table.toUserId),
      createdAtIdx: index('transactions_created_at_idx').on(table.createdAt),
      typeIdx: index('transactions_type_idx').on(table.type),
    };
  },
);

export type Transaction = typeof transactions.$inferSelect;
export type TransactionInsert = typeof transactions.$inferInsert;

/**
 * Enumeración de tipos de transacción
 * Facilita el type-safety en el código
 */
export enum TransactionType {
  PLAYER_TO_PLAYER = 'player_to_player',
  PLAYER_TO_BANK = 'player_to_bank',
  BANK_TO_PLAYER = 'bank_to_player',
}
