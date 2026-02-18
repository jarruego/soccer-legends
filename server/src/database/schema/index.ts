/**
 * Exporta todos los esquemas de Drizzle
 * Esto centraliza los imports y facilita la mantenibilidad
 */

export { users } from './users';
export type { User, UserInsert } from './users';

export { games } from './games';
export type { Game, GameInsert } from './games';

export { gamePlayers } from './game-players';
export type { GamePlayer, GamePlayerInsert } from './game-players';

export { transactions, TransactionType } from './transactions';
export type { Transaction, TransactionInsert } from './transactions';

export { commonFundClaims, CommonFundClaimStatus } from './common-fund-claims';
export type { CommonFundClaim, CommonFundClaimInsert } from './common-fund-claims';

export { seasonalCollectionClaims, SeasonalCollectionClaimStatus } from './seasonal-collection-claims';
export type { SeasonalCollectionClaim, SeasonalCollectionClaimInsert } from './seasonal-collection-claims';

export { timestamps, uuidId, autoId, foreignUuid, getTimestamps } from './types';
