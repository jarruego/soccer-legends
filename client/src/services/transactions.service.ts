/**
 * Servicio de Transacciones
 *
 * Maneja todas las peticiones de transacciones
 */

import { httpClient } from './http-client';
import type { Transaction, FinancialSummary } from '../types/index';

export interface TransferData {
  gameId: string;
  toUserId: string;
  amount: number;
  description?: string;
}

export interface TransferToBankData {
  gameId: string;
  amount: number;
  description?: string;
}

export interface WithdrawFromBankData {
  gameId: string;
  toUserId: string;
  amount: number;
  description?: string;
}

class TransactionsService {
  /**
   * Realiza una transferencia entre jugadores
   */
  async transferBetweenPlayers(data: TransferData): Promise<Transaction> {
    return httpClient.post('/transactions/transfer', data);
  }

  /**
   * Transfiere dinero a la banca
   */
  async transferToBank(data: TransferToBankData): Promise<Transaction> {
    return httpClient.post('/transactions/to-bank', data);
  }

  /**
   * Retira dinero de la banca
   */
  async withdrawFromBank(data: WithdrawFromBankData): Promise<Transaction> {
    return httpClient.post('/transactions/withdraw', data);
  }

  /**
   * Obtiene el historial de transacciones de una partida
   */
  async getGameTransactionHistory(
    gameId: string,
  ): Promise<{ transactionCount: number; transactions: Transaction[] }> {
    return httpClient.get(`/transactions/${gameId}`);
  }

  /**
   * Obtiene mis transacciones en una partida
   */
  async getMyTransactions(
    gameId: string,
  ): Promise<{ transactionCount: number; transactions: Transaction[] }> {
    return httpClient.get(`/transactions/${gameId}/my-transactions`);
  }

  /**
   * Obtiene el balance de la banca
   */
  async getBankBalance(gameId: string): Promise<{ bankBalance: number }> {
    return httpClient.get(`/transactions/${gameId}/bank-balance`);
  }

  /**
   * Obtiene el resumen financiero
   */
  async getFinancialSummary(gameId: string): Promise<FinancialSummary> {
    return httpClient.get(`/transactions/${gameId}/summary`);
  }
}

export const transactionsService = new TransactionsService();
