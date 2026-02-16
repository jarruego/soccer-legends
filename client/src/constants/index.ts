/**
 * Constantes de la aplicación
 */

// API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
export const API_TIMEOUT = 10000; // 10 segundos

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user_data',
  CURRENT_GAME: 'current_game',
};

// Estados
export const GAME_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  FINISHED: 'finished',
} as const;

export const TRANSACTION_TYPE = {
  PLAYER_TO_PLAYER: 'player_to_player',
  PLAYER_TO_BANK: 'player_to_bank',
  BANK_TO_PLAYER: 'bank_to_player',
} as const;

// Mensajes de error
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
  USER_NOT_FOUND: 'Usuario no encontrado',
  GAME_NOT_FOUND: 'Partida no encontrada',
  INVALID_PIN: 'PIN inválido',
  GAME_FULL: 'La partida está llena',
  INSUFFICIENT_BALANCE: 'Saldo insuficiente',
  UNAUTHORIZED: 'No autorizado. Por favor inicia sesión.',
} as const;

// Validaciones
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PIN_LENGTH: 6,
} as const;
