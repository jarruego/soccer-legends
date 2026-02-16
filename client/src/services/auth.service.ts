/**
 * Servicio de Autenticación
 *
 * Maneja todas las peticiones relacionadas con auth
 */

import { httpClient } from './http-client';
import type { AuthResponse, User } from '../types';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  avatar?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  /**
   * Registra un nuevo usuario
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    return httpClient.post('/auth/register', data);
  }

  /**
   * Inicia sesión
   */
  async login(data: LoginData): Promise<AuthResponse> {
    return httpClient.post('/auth/login', data);
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(): Promise<User> {
    return httpClient.get('/auth/profile');
  }
}

export const authService = new AuthService();
