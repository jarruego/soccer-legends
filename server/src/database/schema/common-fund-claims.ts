/**
 * Esquema de tabla Common Fund Claims (Solicitudes de Fondo Común)
 *
 * Registra las solicitudes de jugadores para quedarse con el Fondo Común.
 */

import { pgTable, uuid, varchar, timestamp, foreignKey, index } from 'drizzle-orm/pg-core';
import { getTimestamps } from './types';
import { games } from './games';
import { users } from './users';

export const commonFundClaims = pgTable(
  'common_fund_claims',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    gameId: uuid('game_id').notNull(),
    requesterUserId: uuid('requester_user_id').notNull(),
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
        name: 'common_fund_claims_game_id_fk',
      }).onDelete('cascade'),
      requesterUserIdFk: foreignKey({
        columns: [table.requesterUserId],
        foreignColumns: [users.id],
        name: 'common_fund_claims_requester_user_id_fk',
      }).onDelete('cascade'),
      resolvedByUserIdFk: foreignKey({
        columns: [table.resolvedByUserId],
        foreignColumns: [users.id],
        name: 'common_fund_claims_resolved_by_user_id_fk',
      }).onDelete('set null'),
      gameIdx: index('common_fund_claims_game_id_idx').on(table.gameId),
      requesterIdx: index('common_fund_claims_requester_user_id_idx').on(table.requesterUserId),
      statusIdx: index('common_fund_claims_status_idx').on(table.status),
      createdAtIdx: index('common_fund_claims_created_at_idx').on(table.createdAt),
    };
  },
);

export type CommonFundClaim = typeof commonFundClaims.$inferSelect;
export type CommonFundClaimInsert = typeof commonFundClaims.$inferInsert;

export enum CommonFundClaimStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
