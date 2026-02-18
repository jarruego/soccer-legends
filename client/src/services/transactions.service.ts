/**
 * Servicio de Transacciones
 *
 * Maneja todas las peticiones de transacciones
 */

import { httpClient } from './http-client';
import type { Transaction, FinancialSummary, CommonFundClaim, SeasonalCollectionClaim } from '../types/index';

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

export interface TransferToCommonFundData {
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
    * Transfiere dinero al Fondo Común
   */
  async transferToCommonFund(data: TransferToCommonFundData): Promise<Transaction> {
    return httpClient.post('/transactions/to-common-fund', data);
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
    * Obtiene el balance del Fondo Común
   */
  async getCommonFundBalance(gameId: string): Promise<{ commonFundBalance: number }> {
    return httpClient.get(`/transactions/${gameId}/common-fund-balance`);
  }

  /**
   * Solicita quedarse con todo el Fondo Común
   */
  async requestCommonFundClaim(
    gameId: string,
  ): Promise<{ id: string; status: string; message: string; autoApproved: boolean; amount: number }> {
    return httpClient.post(`/transactions/${gameId}/common-fund-claims/request`);
  }

  /**
   * Obtiene solicitudes pendientes (solo banca)
   */
  async getPendingCommonFundClaims(
    gameId: string,
  ): Promise<{ claimCount: number; claims: CommonFundClaim[] }> {
    return httpClient.get(`/transactions/${gameId}/common-fund-claims/pending`);
  }

  /**
   * Obtiene mi última solicitud del Fondo Común
   */
  async getMyLatestCommonFundClaim(
    gameId: string,
  ): Promise<{ claim: CommonFundClaim | null }> {
    return httpClient.get(`/transactions/${gameId}/common-fund-claims/my-latest`);
  }

  /**
   * Aprueba una solicitud del Fondo Común (solo banca)
   */
  async approveCommonFundClaim(claimId: string): Promise<{ amount: number; message: string }> {
    return httpClient.post(`/transactions/common-fund-claims/${claimId}/approve`);
  }

  /**
   * Rechaza una solicitud del Fondo Común (solo banca)
   */
  async rejectCommonFundClaim(claimId: string): Promise<{ message: string }> {
    return httpClient.post(`/transactions/common-fund-claims/${claimId}/reject`);
  }

  /**
   * Solicita recaudacion por temporada
   */
  async requestSeasonalCollectionClaim(
    gameId: string,
  ): Promise<{ id: string; status: string; message: string; amount: number }> {
    return httpClient.post(`/transactions/${gameId}/seasonal-collection-claims/request`);
  }

  /**
   * Obtiene solicitudes pendientes de recaudacion (solo banca)
   */
  async getPendingSeasonalCollectionClaims(
    gameId: string,
  ): Promise<{ claimCount: number; claims: SeasonalCollectionClaim[] }> {
    return httpClient.get(`/transactions/${gameId}/seasonal-collection-claims/pending`);
  }

  /**
   * Obtiene mi ultima solicitud de recaudacion
   */
  async getMyLatestSeasonalCollectionClaim(
    gameId: string,
  ): Promise<{ claim: SeasonalCollectionClaim | null }> {
    return httpClient.get(`/transactions/${gameId}/seasonal-collection-claims/my-latest`);
  }

  /**
   * Aprueba una solicitud de recaudacion (solo banca)
   */
  async approveSeasonalCollectionClaim(claimId: string): Promise<{ amount: number; message: string }> {
    return httpClient.post(`/transactions/seasonal-collection-claims/${claimId}/approve`);
  }

  /**
   * Rechaza una solicitud de recaudacion (solo banca)
   */
  async rejectSeasonalCollectionClaim(claimId: string): Promise<{ message: string }> {
    return httpClient.post(`/transactions/seasonal-collection-claims/${claimId}/reject`);
  }

  /**
   * Obtiene el resumen financiero
   */
  async getFinancialSummary(gameId: string): Promise<FinancialSummary> {
    return httpClient.get(`/transactions/${gameId}/summary`);
  }
}

export const transactionsService = new TransactionsService();
