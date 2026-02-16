/**
 * Esquema de tabla Users (Usuarios)
 *
 * Esta tabla almacena todos los usuarios registrados en la aplicación.
 * Cada usuario puede crear y unirse a múltiples partidas.
 *
 * Relaciones:
 * - Un usuario puede tener múltiples partidas creadas (games.createdBy)
 * - Un usuario puede participar en múltiples partidas (gamePlayers)
 * - Un usuario puede enviar y recibir múltiples transacciones
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, unique, index } from 'drizzle-orm/pg-core';
import { getTimestamps } from './types';

export const users = pgTable(
  'users',
  {
    // ID único del usuario (UUID)
    id: uuid('id').primaryKey().defaultRandom(),

    // Email único para identificar y autenticar al usuario
    email: varchar('email', { length: 255 }).notNull().unique(),

    // Nombre de usuario (para mostrar en la app)
    username: varchar('username', { length: 100 }).notNull(),

    // Contraseña hasheada con bcrypt
    password: text('password').notNull(),

    // Avatar/foto de perfil (URL o base64)
    avatar: text('avatar'),

    // Teléfono opcional
    phone: varchar('phone', { length: 20 }),

    // Indica si el usuario verificó su email
    isEmailVerified: boolean('is_email_verified').default(false).notNull(),

    // Indica si la cuenta está activa
    isActive: boolean('is_active').default(true).notNull(),

    // Timestamps automáticos
    ...getTimestamps(),
  },
  (table) => {
    return {
      // Índices para búsquedas rápidas
      emailIdx: index('users_email_idx').on(table.email),
      usernameIdx: index('users_username_idx').on(table.username),
      isActiveIdx: index('users_is_active_idx').on(table.isActive),
    };
  },
);

/**
 * Tipo TypeScript inferido automáticamente desde el esquema
 * Esto nos da type-safety sin repetir las columnas
 */
export type User = typeof users.$inferSelect;

/**
 * Tipo para insertar un nuevo usuario
 * Útil en los DTOs y servicios
 */
export type UserInsert = typeof users.$inferInsert;
