/**
 * Store de Partidas con Zustand
 *
 * Maneja el estado de las partidas
 */

import { create } from 'zustand';
import { gamesService } from '@services/games.service';
import type { Game, GameDetail } from '@/types';

interface GamesState {
  // Estado
  currentGame: GameDetail | null;
  userGames: Game[];
  availableGames: Game[];
  lastJoinedGameId: string | null;
  isLoading: boolean;
  error: string | null;

  // Acciones
  setCurrentGame: (game: GameDetail | null) => void;
  loadUserGames: () => Promise<void>;
  loadAvailableGames: () => Promise<void>;
  loadGameDetails: (gameId: string) => Promise<void>;
  joinGame: (pin: string) => Promise<string>;
  leaveGame: (gameId: string) => Promise<void>;
  clearError: () => void;
}

export const useGamesStore = create<GamesState>((set) => ({
  currentGame: null,
  userGames: [],
  availableGames: [],
  lastJoinedGameId: null,
  isLoading: false,
  error: null,

  setCurrentGame: (game) => set({ currentGame: game }),

  loadUserGames: async () => {
    set({ isLoading: true, error: null });
    try {
      const games = await gamesService.getUserGames();
      set({ userGames: games, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadAvailableGames: async () => {
    set({ isLoading: true, error: null });
    try {
      const games = await gamesService.getAvailableGames();
      set({ availableGames: games, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadGameDetails: async (gameId: string) => {
    set({ isLoading: true, error: null });
    try {
      const game = await gamesService.getGame(gameId);
      set({ currentGame: game, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  joinGame: async (pin: string): Promise<string> => {
    set({ isLoading: true, error: null });
    try {
      const game = await gamesService.joinGame({ pin });
      // Recargar partidas del usuario
      const userGames = await gamesService.getUserGames();
      set({ 
        userGames, 
        lastJoinedGameId: game.id,
        isLoading: false 
      });
      return game.id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  leaveGame: async (gameId: string) => {
    set({ isLoading: true, error: null });
    try {
      await gamesService.leaveGame(gameId);
      
      // Actualizar la lista local removiendo la partida
      set((state) => ({
        currentGame: null,
        userGames: state.userGames.filter((g) => g.id !== gameId),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMsg = typeof error === 'string' ? error : (error?.message || 'Error desconocido');
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
