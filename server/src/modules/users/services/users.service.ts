import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { GamesRepository } from '@/modules/games/repositories/games.repository';
import { TransactionsRepository } from '@/modules/transactions/repositories/transactions.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly gamesRepository: GamesRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  /**
   * Elimina un usuario y todos sus datos asociados (partidas creadas, transacciones, participaciones)
   */
  async deleteUserAndData(userId: string): Promise<void> {
    // 1. Eliminar todas las transacciones donde sea fromUserId o toUserId
    await this.transactionsRepository.deleteAllByUser(userId);
    // 2. Eliminar todas las partidas creadas por el usuario (y sus gamePlayers)
    await this.gamesRepository.deleteAllByCreator(userId);
    // 3. Eliminar participaciones en partidas (gamePlayers)
    await this.gamesRepository.deleteAllParticipationsByUser(userId);
    // 4. Eliminar el usuario
    await this.usersRepository.deleteById(userId);
  }
}
