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

export { timestamps, uuidId, autoId, foreignUuid, getTimestamps } from './types';
