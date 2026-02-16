/**
 * DTOs (Data Transfer Objects) para el módulo de Autenticación
 *
 * Los DTOs validan y transforman los datos que vienen del cliente.
 * Usando class-validator para validación automática.
 */

import { IsEmail, IsString, MinLength, MaxLength, IsOptional, ValidationArguments } from 'class-validator';

/**
 * DTO para registrar un nuevo usuario
 *
 * Validaciones:
 * - Email: formato válido y único en BD
 * - Username: 3-50 caracteres
 * - Password: mínimo 8 caracteres
 */
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3, { message: 'El username debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El username no puede exceder 50 caracteres' })
  username!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

/**
 * DTO para iniciar sesión
 *
 * El usuario puede usar email o username para identificarse
 */
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;
}

/**
 * DTO para actualizar el perfil del usuario
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username!: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
