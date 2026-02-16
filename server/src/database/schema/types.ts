/**
 * Tipos base y utilidades para los esquemas de Drizzle
 * Evita repetición de código y centraliza las configuraciones comunes
 */

import { pgTable, serial, varchar, timestamp, text, decimal, boolean, integer, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Crea timestamps automáticos para created_at y updated_at
 * Esto asegura que se registren automáticamente en la BD
 */
export const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

/**
 * Columna de ID UUID automático
 * Más seguro que IDs secuenciales
 */
export const uuidId = () => uuid('id').primaryKey().defaultRandom();

/**
 * Columna de ID numérico secuencial (para relaciones simples)
 */
export const autoId = () => serial('id').primaryKey();

/**
 * Columna de UUID para referencias a otras tablas
 */
export const foreignUuid = (name: string) => uuid(name).notNull();

/**
 * Función para crear columnas de timestamps más fácilmente
 */
export function getTimestamps() {
  return {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  };
}
