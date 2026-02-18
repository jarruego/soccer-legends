/**
 * Módulo de Usuarios
 *
 * Agrupa la lógica relacionada con usuarios
 * - Repositorio (acceso a BD)
 * - Servicios
 * - Controladores
 */

import { Module } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UsersController } from './controllers/users.controller';

import { TransactionsService } from '../transactions/services/transactions.service';
import { TransactionsRepository } from '../transactions/repositories/transactions.repository';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [GamesModule],
  controllers: [UsersController],
  providers: [UsersRepository, TransactionsService, TransactionsRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
