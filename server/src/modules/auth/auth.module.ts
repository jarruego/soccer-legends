/**
 * Módulo de Autenticación
 *
 * Agrupa todos los componentes relacionados con autenticación:
 * - Controlador (endpoints)
 * - Servicio (lógica de negocio)
 * - Estrategia JWT (validación de tokens)
 * - Guard JWT (protección de rutas)
 * - Decorador @CurrentUser
 *
 * Se importa en AppModule para estar disponible globalmente
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersRepository } from '@/modules/users/repositories/users.repository';

@Module({
  // Importar módulos externos necesarios
  imports: [
    // Módulo de Passport (estrategias de autenticación)
    PassportModule,

    // Módulo de JWT con configuración
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION || '24h',
      },
    }),
  ],

  // Proveedores (servicios, guards, strategies)
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    UsersRepository,
  ],

  // Controladores
  controllers: [AuthController],

  // Exportar servicios y guards para que otros módulos puedan usarlos
  exports: [AuthService, JwtAuthGuard, UsersRepository],
})
export class AuthModule {}
