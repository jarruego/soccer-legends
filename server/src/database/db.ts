/**
 * Configuración de la conexión a la base de datos con Drizzle
 *
 * Este archivo centraliza la configuración y conexión a PostgreSQL.
 * Se usa en toda la aplicación para hacer queries.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Crear pool de conexiones a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'soccer_legends',
});

// Crear instancia de Drizzle con el schema
export const db = drizzle(pool, { schema });

// Tipo de la BD para facilitar el type-checking en repositorios
export type Database = typeof db;

// Función para cerrar la conexión (útil en shutdown)
export async function closeDatabase(): Promise<void> {
  await pool.end();
}
