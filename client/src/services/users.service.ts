import { httpClient } from './http-client';

export class UsersService {
  /**
   * Elimina la cuenta del usuario autenticado y todos sus datos asociados
   */
  async deleteMe(): Promise<void> {
    await httpClient.delete('/users/me');
  }
}

export const usersService = new UsersService();
