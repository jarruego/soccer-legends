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

@Module({
  imports: [GamesModule],
  providers: [TransactionsService, TransactionsRepository],
  controllers: [TransactionsController],
  exports: [TransactionsService, TransactionsRepository],
})
export class TransactionsModule {}
