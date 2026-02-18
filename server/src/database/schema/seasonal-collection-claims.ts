/**
 * Esquema de tabla Seasonal Collection Claims (Solicitudes de recaudacion por temporada)
 */

import { pgTable, uuid, varchar, integer, timestamp, foreignKey, index } from 'drizzle-orm/pg-core';
import { getTimestamps } from './types';
import { games } from './games';
import { users } from './users';

export const seasonalCollectionClaims = pgTable(
  'seasonal_collection_claims',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id').notNull(),
    requesterUserId: uuid('requester_user_id').notNull(),
    amount: integer('amount').notNull(),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    resolvedByUserId: uuid('resolved_by_user_id'),
    resolvedAt: timestamp('resolved_at'),
    ...getTimestamps(),
  },
  (table) => {
    return {
      gameIdFk: foreignKey({
        columns: [table.gameId],
        foreignColumns: [games.id],
        name: 'seasonal_collection_claims_game_id_fk',
      }).onDelete('cascade'),
      requesterUserIdFk: foreignKey({
        columns: [table.requesterUserId],
        foreignColumns: [users.id],
        name: 'seasonal_collection_claims_requester_user_id_fk',
      }).onDelete('cascade'),
      resolvedByUserIdFk: foreignKey({
        columns: [table.resolvedByUserId],
        foreignColumns: [users.id],
        name: 'seasonal_collection_claims_resolved_by_user_id_fk',
      }).onDelete('set null'),
      gameIdx: index('seasonal_collection_claims_game_id_idx').on(table.gameId),
      requesterIdx: index('seasonal_collection_claims_requester_user_id_idx').on(table.requesterUserId),
      statusIdx: index('seasonal_collection_claims_status_idx').on(table.status),
      createdAtIdx: index('seasonal_collection_claims_created_at_idx').on(table.createdAt),
    };
  },
);

export type SeasonalCollectionClaim = typeof seasonalCollectionClaims.$inferSelect;
export type SeasonalCollectionClaimInsert = typeof seasonalCollectionClaims.$inferInsert;

export enum SeasonalCollectionClaimStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}