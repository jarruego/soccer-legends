/**
 * Controlador de Autenticación
 *
 * Maneja los endpoints:
 * - POST /auth/register - Registrar nuevo usuario
 * - POST /auth/login - Iniciar sesión
 * - GET /auth/profile - Obtener perfil del usuario autenticado
 */

import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from '../dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { User } from '@/database/schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registra un nuevo usuario
   *
   * @route POST /auth/register
   * @body RegisterDto - Email, username, password
   * @returns AuthResponseDto - Usuario y token JWT
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Inicia sesión con email y contraseña
   *
   * @route POST /auth/login
   * @body LoginDto - Email y contraseña
   * @returns AuthResponseDto - Usuario y token JWT
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  /**
   * Obtiene el perfil del usuario autenticado
   *
   * Solo accesible para usuarios autenticados (requiere token JWT)
   *
   * @route GET /auth/profile
   * @guard JwtAuthGuard
   * @returns Datos del usuario autenticado
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User): object {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }
}
