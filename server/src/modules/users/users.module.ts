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
import { UsersService } from './services/users.service';
import { GamesRepository } from '../games/repositories/games.repository';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [GamesModule, TransactionsModule],
  controllers: [UsersController],
  providers: [UsersRepository, UsersService, GamesRepository, TransactionsService, TransactionsRepository],
  exports: [UsersRepository, UsersService],
})
export class UsersModule {}
