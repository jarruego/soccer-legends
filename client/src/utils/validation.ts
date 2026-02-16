/**
 * Utilidades de validación
 */

import { VALIDATION } from '@constants/index';

/**
 * Valida un email
 */
export const isValidEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

/**
 * Valida una contraseña
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
};

/**
 * Valida un username
 */
export const isValidUsername = (username: string): boolean => {
  return (
    username.length >= VALIDATION.USERNAME_MIN_LENGTH &&
    username.length <= VALIDATION.USERNAME_MAX_LENGTH
  );
};

/**
 * Valida un PIN
 */
export const isValidPin = (pin: string): boolean => {
  return pin.length === VALIDATION.PIN_LENGTH;
};

/**
 * Valida un monto de dinero
 */
export const isValidAmount = (amount: number | string): boolean => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num > 0 && !isNaN(num);
};

/**
 * Obtiene mensajes de error de validación
 */
export const getValidationError = (field: string, value: string): string | null => {
  switch (field) {
    case 'email':
      return !isValidEmail(value) ? 'Email inválido' : null;
    case 'password':
      return !isValidPassword(value)
        ? `La contraseña debe tener al menos ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres`
        : null;
    case 'username':
      return !isValidUsername(value)
        ? `El username debe tener entre ${VALIDATION.USERNAME_MIN_LENGTH} y ${VALIDATION.USERNAME_MAX_LENGTH} caracteres`
        : null;
    case 'pin':
      return !isValidPin(value) ? `El PIN debe tener ${VALIDATION.PIN_LENGTH} caracteres` : null;
    default:
      return null;
  }
};
