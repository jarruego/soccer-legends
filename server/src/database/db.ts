/**
 * Configuración de la conexión a la base de datos con Drizzle
 *
 * Este archivo centraliza la configuración y conexión a PostgreSQL.
 * Se usa en toda la aplicación para hacer queries.
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// Crear pool de conexiones a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

// Crear instancia de Drizzle con el schema
export const db = drizzle(pool, { schema });

// Tipo de la BD para facilitar el type-checking en repositorios
export type Database = typeof db;

// Función para cerrar la conexión (útil en shutdown)
export async function closeDatabase(): Promise<void> {
  await pool.end();
}
