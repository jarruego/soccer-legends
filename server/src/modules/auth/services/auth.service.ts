/**
 * Servicio de Autenticación
 *
 * Maneja la lógica de:
 * - Registro de nuevos usuarios
 * - Login y validación de credenciales
 * - Generación y validación de tokens JWT
 * - Hashing de contraseñas
 */

import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, AuthResponseDto, JwtPayload } from '../dto';
import { UsersRepository } from '@/modules/users/repositories/users.repository';
import type { User } from '@/database/schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo usuario
   *
   * @param registerDto - Email, username, password
   * @returns Usuario creado con token JWT
   * @throws ConflictException si el email ya existe
   * @throws BadRequestException si los datos no son válidos
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Validar que el email no esté registrado
    const existingUser = await this.usersRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Validar que el username no esté ocupado
    const existingUsername = await this.usersRepository.findByUsername(registerDto.username);
    if (existingUsername) {
      throw new ConflictException('El username ya está en uso');
    }

    // Hashear contraseña
    const hashedPassword = await this.hashPassword(registerDto.password);

    // Crear el usuario
    const newUser = await this.usersRepository.create({
      email: registerDto.email.toLowerCase(),
      username: registerDto.username,
      password: hashedPassword,
      avatar: registerDto.avatar || null,
      phone: registerDto.phone || null,
      isEmailVerified: false,
      isActive: true,
    });

    // Generar token JWT
    const accessToken = this.generateToken(newUser);

    return {
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        avatar: newUser.avatar,
        phone: newUser.phone,
      },
      message: 'Usuario registrado exitosamente',
    };
  }

  /**
   * Inicia sesión con email y contraseña
   *
   * @param loginDto - Email y contraseña
   * @returns Usuario autenticado con token JWT
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findByEmail(loginDto.email);

    // Usuario no encontrado
    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Usuario inactivo
    if (!user.isActive) {
      throw new UnauthorizedException('Tu cuenta ha sido desactivada');
    }

    // Validar contraseña
    const isPasswordValid = await this.verifyPassword(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Generar token JWT
    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        phone: user.phone,
      },
      message: 'Sesión iniciada exitosamente',
    };
  }

  /**
   * Valida un token JWT y retorna el payload
   *
   * @param token - Token JWT
   * @returns Payload del token (sub e info)
   * @throws UnauthorizedException si el token es inválido o expiró
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  /**
   * Obtiene un usuario por su ID (para estrategia Passport)
   *
   * @param id - ID del usuario
   * @returns Datos del usuario
   * @throws UnauthorizedException si no existe
   */
  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Genera un token JWT para un usuario
   *
   * @param user - Datos del usuario
   * @returns Token JWT
   */
  private generateToken(user: User): string {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION || '24h',
    });
  }

  /**
   * Hashea una contraseña usando bcrypt
   *
   * @param password - Contraseña en texto plano
   * @returns Contraseña hasheada
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica una contraseña contra su hash
   *
   * @param password - Contraseña en texto plano
   * @param hash - Hash almacenado en BD
   * @returns true si coinciden, false si no
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
    /**
   * Actualiza el perfil del usuario autenticado
   * @param userId - ID del usuario
   * @param updateProfileDto - Datos a actualizar (username, avatar, phone)
   * @returns Usuario actualizado
   */
  async updateProfile(userId: string, updateProfileDto: Partial<Pick<User, 'username' | 'avatar' | 'phone'>>): Promise<User> {
    // Validar que el usuario existe
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Si se quiere cambiar el username, comprobar que no esté en uso por otro
    if (updateProfileDto.username && updateProfileDto.username !== user.username) {
      const existing = await this.usersRepository.findByUsername(updateProfileDto.username);
      if (existing && existing.id !== userId) {
        throw new ConflictException('El username ya está en uso');
      }
    }

    const updated = await this.usersRepository.update(userId, updateProfileDto);
    if (!updated) {
      throw new BadRequestException('No se pudo actualizar el perfil');
    }
    return updated;
  }
}
