/**
 * DTOs de respuesta para autenticación
 *
 * Utilizados para enviar datos al cliente de forma consistente
 */

/**
 * Respuesta cuando un usuario se registra o inicia sesión correctamente
 */
export class AuthResponseDto {
  // Token JWT para futuras peticiones autenticadas
  accessToken!: string;

  // Información del usuario autenticado
  user!: {
    id: string;
    email: string;
    username: string;
    avatar: string | null;
    phone: string | null;
  };

  // Mensaje opcional
  message?: string;
}

/**
 * Payload del JWT
 *
 * Esto es lo que se codifica dentro del token
 */
export class JwtPayload {
  // ID del usuario
  sub!: string;

  // Email del usuario
  email!: string;

  // Timestamp de emisión
  iat!: number;

  // Timestamp de expiración
  exp!: number;
}
