/**
 * Controlador de Autenticación
 *
 * Maneja los endpoints:
 * - POST /auth/register - Registrar nuevo usuario
 * - POST /auth/login - Iniciar sesión
 * - GET /auth/profile - Obtener perfil del usuario autenticado
 */

import { Controller, Post, Get, Patch, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, AuthResponseDto, UpdateProfileDto } from '../dto';
import { ChangePasswordDto } from '../dto/auth.dto';
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
  /**
   * Actualiza el perfil del usuario autenticado
   *
   * @route PATCH /auth/profile
   * @guard JwtAuthGuard
   * @body UpdateProfileDto
   * @returns Usuario actualizado
   */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<object> {
    const updated = await this.authService.updateProfile(user.id, updateProfileDto);
    return {
      id: updated.id,
      email: updated.email,
      username: updated.username,
      avatar: updated.avatar,
      phone: updated.phone,
      isEmailVerified: updated.isEmailVerified,
      createdAt: updated.createdAt,
    };
  }

  /**
   * Cambia la contraseña del usuario autenticado
   *
   * @route PATCH /auth/change-password
   * @guard JwtAuthGuard
   * @body ChangePasswordDto
   * @returns Mensaje de éxito o error
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // Log para depuración
    console.log('change-password body:', changePasswordDto);
    console.log('change-password user:', user);
    try {
      await this.authService.changePassword(user.id, changePasswordDto);
      console.log('change-password: éxito');
      return { message: 'Contraseña cambiada correctamente' };
    } catch (err) {
      console.error('change-password error:', err);
      throw err;
    }
  }
}
