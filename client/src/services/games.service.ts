/**
 * Servicio de Partidas (Games)
 *
 * Maneja todas las peticiones relacionadas con partidas
 */

import { httpClient } from './http-client';
import type { Game, GameDetail, FinancialSummary } from '../types/index';

export interface CreateGameData {
  name: string;
  description?: string;
  initialBalance: number;
  maxPlayers: number;
  location?: string;
}

export interface JoinGameData {
  pin: string;
}

class GamesService {
  /**
   * Crea una nueva partida
   */
  async createGame(data: CreateGameData): Promise<Game & { pin: string }> {
    return httpClient.post('/games', data);
  }

  /**
   * Obtiene detalles de una partida
   */
  async getGame(gameId: string): Promise<GameDetail> {
    return httpClient.get(`/games/${gameId}`);
  }

  /**
   * Obtiene las partidas del usuario
   */
  async getUserGames(): Promise<Game[]> {
    return httpClient.get('/games');
  }

  /**
   * Obtiene partidas disponibles
   */
  async getAvailableGames(): Promise<Game[]> {
    return httpClient.get('/games/available');
  }

  /**
   * Se une a una partida con PIN
   */
  async joinGame(data: JoinGameData): Promise<Game> {
    return httpClient.post('/games/join', data);
  }

  /**
   * Abandona una partida
   */
  async leaveGame(gameId: string): Promise<void> {
    return httpClient.delete(`/games/${gameId}`);
  }

  /**
   * Cambia el estado de una partida
   */
  async updateGameStatus(gameId: string, status: string): Promise<Game> {
    return httpClient.patch(`/games/${gameId}/status`, { status });
  }

  /**
   * Obtiene el balance de un jugador
   */
  async getPlayerBalance(gameId: string, userId: string): Promise<{ balance: number }> {
    return httpClient.get(`/games/${gameId}/balance/${userId}`);
  }

  /**
   * Obtiene el resumen financiero de la partida
   */
  async getFinancialSummary(gameId: string): Promise<FinancialSummary> {
    return httpClient.get(`/transactions/${gameId}/summary`);
  }
}

export const gamesService = new GamesService();
