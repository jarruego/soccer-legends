/**
 * Guard de Autenticación JWT
 *
 * Se usa con @UseGuards(JwtAuthGuard) para proteger rutas
 * Valida automáticamente el token JWT en el header Authorization
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que usa la estrategia JWT
 *
 * Uso:
 * @Get('/profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@Request() req) {
 *   return req.user; // Usuario autenticado
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
