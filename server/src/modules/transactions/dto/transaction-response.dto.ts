/**
 * DTOs de respuesta para Transacciones
 */

import type { Transaction } from '@/database/schema';

/**
 * Respuesta de una transacción exitosa
 */
export class TransactionResponseDto {
  id!: string;
  gameId!: string;
  fromUserId: string | null = null;
  toUserId: string | null = null;
  amount!: string;
  description: string | null = null;
  type!: string;
  createdAt!: Date;
  message!: string;
}

/**
 * Respuesta con historial de transacciones
 */
export class TransactionHistoryDto {
  id!: string;
  gameId!: string;
  fromUser?: {
    id: string;
    username: string;
    avatar: string | null;
  };
  toUser?: {
    id: string;
    username: string;
    avatar: string | null;
  };
  amount!: string;
  type!: string;
  description: string | null = null;
  createdAt!: Date;
}

/**
 * Balance de banca de una partida
 */
export class BankBalanceDto {
  gameId!: string;
  bankBalance!: string;
  lastUpdated!: Date;
}
