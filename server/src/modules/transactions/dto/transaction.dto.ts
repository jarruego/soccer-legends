/**
 * DTOs para el módulo de Transacciones
 *
 * Estos DTOs validan y transforman las transferencias de dinero
 */

import { IsString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

/**
 * DTO para crear una transacción entre jugadores
 */
export class CreateTransactionDto {
  @IsUUID()
  gameId!: string;

  @IsUUID()
  toUserId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO para transferencia a la banca
 */
export class TransferToBankDto {
  @IsUUID()
  gameId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO para transferencia al Fondo Común
 */
export class TransferToCommonFundDto {
  @IsUUID()
  gameId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO para solicitar el Fondo Común
 */
export class RequestCommonFundClaimDto {
  @IsUUID()
  gameId!: string;
}

/**
 * DTO para resolver una solicitud del Fondo Común
 */
export class ResolveCommonFundClaimDto {
  @IsUUID()
  claimId!: string;
}

/**
 * DTO para retirada de la banca
 */
export class WithdrawFromBankDto {
  @IsUUID()
  gameId!: string;

  @IsUUID()
  toUserId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
