/**
 * Módulo raíz de la aplicación
 *
 * Aquí se importan todos los módulos de la aplicación
 * y se configuran las opciones globales.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/database/database.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { GamesModule } from '@/modules/games/games.module';
import { TransactionsModule } from '@/modules/transactions/transactions.module';
import { HealthController } from '@/common/health.controller';

@Module({
  imports: [
    // Cargar variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Módulo de base de datos
    DatabaseModule,

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    GamesModule,
    TransactionsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
