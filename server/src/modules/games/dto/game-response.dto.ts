/**
 * DTOs de respuesta para Games
 */

import type { Game, GamePlayer, User } from '@/database/schema';

/**
 * Respuesta con información de una partida
 */
export class GameResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  pin!: string;
  initialBalance!: string;
  maxPlayers!: number;
  status!: string;
  location!: string | null;
  createdBy!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

/**
 * Respuesta con lista de jugadores de una partida
 */
export class GamePlayerResponseDto {
  gameId!: string;
  userId!: string;
  username!: string;
  avatar!: string | null;
  currentBalance!: string;
  createdAt!: Date;
}

/**
 * Respuesta completa de una partida con jugadores
 */
export class GameDetailResponseDto extends GameResponseDto {
  players: GamePlayerResponseDto[] = [];
  playerCount!: number;
}

/**
 * Respuesta al crear una partida
 */
export class CreateGameResponseDto {
  id!: string;
  pin!: string;
  name!: string;
  message!: string;
}

/**
 * Respuesta al unirse a una partida
 */
export class JoinGameResponseDto {
  id!: string;
  name!: string;
  playerCount!: number;
  maxPlayers!: number;
  message!: string;
}
