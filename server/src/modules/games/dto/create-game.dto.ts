/**
 * DTOs para el módulo de Games (Partidas)
 *
 * Estos DTOs validan y transforman los datos que vienen del cliente
 */

import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

/**
 * DTO para crear una nueva partida
 */
export class CreateGameDto {
  @IsString()
  name: string = '';

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  initialBalance: number = 0;

  @IsNumber()
  @Min(2)
  @Max(4)
  maxPlayers: number = 4;

  @IsOptional()
  @IsString()
  location?: string;
}

/**
 * DTO para unirse a una partida
 */
export class JoinGameDto {
  @IsString()
  pin: string = '';
}

/**
 * DTO para actualizar una partida
 */
export class UpdateGameDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  status?: string; // 'pending', 'active', 'finished'
}

/**
 * DTO para actualizar el balance de un jugador
 */
export class UpdatePlayerBalanceDto {
  @IsNumber()
  newBalance: number = 0;
}
