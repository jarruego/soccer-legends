/**
 * Estrategia JWT para Passport
 *
 * Se encarga de validar los tokens JWT automáticamente
 * en las rutas protegidas con @UseGuards(JwtAuthGuard)
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../services/auth.service';
import type { JwtPayload } from '../dto';
import type { User } from '@/database/schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      // Extraer el token del header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Clave secreta para validar la firma del token
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',

      // No ignorar expiración
      ignoreExpiration: false,
    });
  }

  /**
   * Valida el payload del JWT
   *
   * Este método se llama automáticamente cuando Passport valida el token.
   * Si retorna un objeto, se adjunta al request en req.user
   *
   * @param payload - Payload decodificado del token
   * @returns Usuario autenticado
   */
  async validate(payload: JwtPayload): Promise<User> {
    // El payload contiene sub (user id) y email
    // Obtenemos el usuario completo de la BD
    const user = await this.authService.getUserById(payload.sub);

    return user;
  }
}
