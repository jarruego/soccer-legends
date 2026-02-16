/**
 * Módulo de Games (Partidas)
 *
 * Agrupa toda la lógica de partidas:
 * - Controlador
 * - Servicio
 * - Repositorio
 */

import { Module } from '@nestjs/common';
import { GamesService } from './services/games.service';
import { GamesController } from './controllers/games.controller';
import { GamesRepository } from './repositories/games.repository';

@Module({
  providers: [GamesService, GamesRepository],
  controllers: [GamesController],
  exports: [GamesService, GamesRepository],
})
export class GamesModule {}
