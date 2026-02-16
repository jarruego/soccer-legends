/**
 * Esquema de tabla Games (Partidas)
 *
 * Esta tabla representa una partida de fútbol donde los jugadores
 * se reúnen para transferir dinero entre ellos.
 *
 * Relaciones:
 * - Una partida es creada por un usuario (createdBy -> users.id)
 * - Una partida puede tener múltiples jugadores (gamePlayers)
 * - Una partida puede tener múltiples transacciones (transactions)
 *
 * Estados de partida:
 * - "pending": Esperando a que se unan más jugadores
 * - "active": En progreso, se pueden hacer transferencias
 * - "finished": Partida terminada
 */

import { pgTable, uuid, varchar, text, integer, decimal, timestamp, foreignKey, index } from 'drizzle-orm/pg-core';
import { getTimestamps } from './types';
import { users } from './users';

export const games = pgTable(
  'games',
  {
    // ID único de la partida
    id: uuid('id').primaryKey().defaultRandom(),

    // Usuario que creó la partida
    createdBy: uuid('created_by').notNull(),

    // Nombre de la partida (ej: "Partido de los viernes")
    name: varchar('name', { length: 100 }).notNull(),

    // PIN/contraseña para unirse a la partida
    // Generado automáticamente, 6 caracteres alfanuméricos
    pin: varchar('pin', { length: 10 }).notNull().unique(),

    // Descripción opcional de la partida
    description: text('description'),

    // Cantidad de dinero inicial que tiene cada jugador
    initialBalance: decimal('initial_balance', { precision: 10, scale: 2 }).notNull().default('0.00'),

    // Número de jugadores que pueden participar (2-4)
    maxPlayers: integer('max_players').notNull().default(4),

    // Estado actual de la partida
    status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, active, finished

    // Ubicación donde se juega (opcional)
    location: varchar('location', { length: 255 }),

    // Timestamps automáticos
    ...getTimestamps(),
  },
  (table) => {
    return {
      // Relación con usuarios
      createdByFk: foreignKey({
        columns: [table.createdBy],
        foreignColumns: [users.id],
        name: 'games_created_by_fk',
      }),

      // Índices para búsquedas rápidas
      pinIdx: index('games_pin_idx').on(table.pin),
      createdByIdx: index('games_created_by_idx').on(table.createdBy),
      statusIdx: index('games_status_idx').on(table.status),
      createdAtIdx: index('games_created_at_idx').on(table.createdAt),
    };
  },
);

export type Game = typeof games.$inferSelect;
export type GameInsert = typeof games.$inferInsert;
