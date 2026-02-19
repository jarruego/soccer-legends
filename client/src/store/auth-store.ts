/**
 * Store de Autenticación con Zustand
 *
 * Maneja el estado global de autenticación
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type RegisterData, type LoginData } from '@services/auth.service';
import { STORAGE_KEYS } from '@constants/index';
import type { User, AuthResponse } from '@/types';

interface AuthState {
  // Estado
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Acciones
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

import { authService } from '../services/auth.service';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      
      // Guardar token y usuario
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

      set({
        user: response.user as User,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Error en el registro';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(data);

      // Guardar token y usuario
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

      set({
        user: response.user as User,
        token: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Email o contraseña incorrectos';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      // Limpiar storage
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);

      if (token && userData) {
        const user = JSON.parse(userData);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  updateUser: async (data: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await authService.updateProfile(data);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      set({ user: updated, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Error al actualizar perfil', isLoading: false });
      // Log para depuración
      console.log('updateUser error:', error);
      // Axios: error.response, Fetch: error.status
      const status = error?.status || error?.response?.status;
      const message = error?.message || error?.response?.data?.message || '';
      if (status === 409) {
        throw { status: 409, message };
      }
      throw error;
    }
  },
}));
