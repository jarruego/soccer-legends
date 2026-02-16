/**
 * Módulo de Database para NestJS
 *
 * Este módulo proporciona la instancia de Drizzle a toda la aplicación
 * usando la inyección de dependencias de NestJS.
 */

import { Module } from '@nestjs/common';
import { db } from './db';

// Proveedor que inyecta la BD en los servicios
export const DATABASE_PROVIDER = 'DATABASE';

@Module({
  providers: [
    {
      provide: DATABASE_PROVIDER,
      useValue: db,
    },
  ],
  exports: [DATABASE_PROVIDER],
})
export class DatabaseModule {}

// También exportamos la BD directamente para usos simples
export { db } from './db';
export type { Database } from './db';
