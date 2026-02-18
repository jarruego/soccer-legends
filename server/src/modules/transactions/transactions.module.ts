/**
 * Módulo de Transacciones
 *
 * Agrupa toda la lógica de transacciones:
 * - Controlador
 * - Servicio
 * - Repositorio
 */

import { Module } from '@nestjs/common';
import { TransactionsService } from './services/transactions.service';
import { TransactionsController } from './controllers/transactions.controller';
import { TransactionsRepository } from './repositories/transactions.repository';
import { GamesModule } from '@/modules/games/games.module';
import { UsersRepository } from '@/modules/users/repositories/users.repository';

@Module({
  imports: [GamesModule],
  providers: [TransactionsService, TransactionsRepository, UsersRepository],
  controllers: [TransactionsController],
  exports: [TransactionsService, TransactionsRepository],
})
export class TransactionsModule {}
