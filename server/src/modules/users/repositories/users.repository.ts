/**
 * Repositorio de Usuarios
 *
 * Centraliza toda la lógica de acceso a datos de usuarios.
 * Esto separa la lógica de BD del servicio de autenticación.
 *
 * Principio de responsabilidad única:
 * - El servicio maneja la lógica de negocio
 * - El repositorio maneja la comunicación con la BD
 */

import { Injectable } from '@nestjs/common';
import { db } from '@/database/db';
import { users, type User, type UserInsert } from '@/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersRepository {
  /**
   * Obtiene un usuario por su ID
   * @param id - ID del usuario
   * @returns Datos del usuario o null si no existe
   */
  async findById(id: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    return result || null;
  }

  /**
   * Obtiene un usuario por su email
   * @param email - Email del usuario
   * @returns Datos del usuario o null si no existe
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    return result || null;
  }

  /**
   * Obtiene un usuario por su username
   * @param username - Username del usuario
   * @returns Datos del usuario o null si no existe
   */
  async findByUsername(username: string): Promise<User | null> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    return result || null;
  }

  /**
   * Crea un nuevo usuario
   * @param userData - Datos del usuario a crear
   * @returns Usuario creado
   */
  async create(userData: UserInsert): Promise<User> {
    const result = await db.insert(users).values(userData).returning();

    return result[0];
  }

  /**
   * Actualiza un usuario
   * @param id - ID del usuario
   * @param updateData - Datos a actualizar
   * @returns Usuario actualizado
   */
  async update(id: string, updateData: Partial<UserInsert>): Promise<User | null> {
    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Elimina un usuario
   * @param id - ID del usuario
   * @returns true si se eliminó, false si no existe
   */
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();

    return result.length > 0;
  }

  /**
   * Obtiene todos los usuarios (solo para administración)
   * @returns Lista de todos los usuarios
   */
  async findAll(): Promise<User[]> {
    return db.query.users.findMany();
  }

  /**
   * Verifica si un email ya existe
   * @param email - Email a verificar
   * @returns true si existe, false si no
   */
  async emailExists(email: string): Promise<boolean> {
    const result = await this.findByEmail(email);
    return result !== null;
  }
}
