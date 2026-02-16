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

@Module({
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
