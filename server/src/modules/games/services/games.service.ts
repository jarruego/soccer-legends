/**
 * Servicio de Games (Partidas)
 *
 * Maneja la lógica de:
 * - Crear partidas con PIN único
 * - Unirse a partidas
 * - Gestionar jugadores
 * - Cambiar estado de partida
 */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { GamesRepository } from '../repositories/games.repository';
import { CreateGameDto, JoinGameDto, UpdateGameDto } from '../dto';
import type { Game, GamePlayer } from '@/database/schema';

@Injectable()
export class GamesService {
  constructor(private readonly gamesRepository: GamesRepository) {}

  /**
   * Genera un PIN único de 6 caracteres (números y letras mayúsculas)
   * @returns PIN generado
   */
  private generatePin(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pin = '';
    for (let i = 0; i < 6; i++) {
      pin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pin;
  }

  /**
   * Crea una nueva partida
   *
   * @param userId - ID del usuario creador
   * @param createGameDto - Datos de la partida
   * @returns Partida creada con PIN
   */
  async createGame(userId: string, createGameDto: CreateGameDto): Promise<Game> {
    if (createGameDto.maxPlayers < 2 || createGameDto.maxPlayers > 8) {
      throw new BadRequestException('El número de jugadores debe estar entre 2 y 8');
    }

    if (createGameDto.initialBalance < 0) {
      throw new BadRequestException('El balance inicial no puede ser negativo');
    }

    const maxTransfer = createGameDto.maxTransfer ?? 500;
    if (maxTransfer < 5 || maxTransfer > 500) {
      throw new BadRequestException('La transferencia máxima debe estar entre 5 y 500');
    }

    const seasonalCollection = createGameDto.seasonalCollection ?? 30;
    if (seasonalCollection < 0 || seasonalCollection > 500) {
      throw new BadRequestException('La recaudación por temporada debe estar entre 0 y 500');
    }

    // Generar PIN único
    let pin = this.generatePin();
    let existingGame = await this.gamesRepository.findByPin(pin);

    // Intentar generar un PIN único (máximo 10 intentos)
    let attempts = 0;
    while (existingGame && attempts < 10) {
      pin = this.generatePin();
      existingGame = await this.gamesRepository.findByPin(pin);
      attempts++;
    }

    if (existingGame) {
      throw new BadRequestException('No se pudo generar un PIN único. Intenta más tarde.');
    }

    // Crear la partida
    const game = await this.gamesRepository.create({
      createdBy: userId,
      name: createGameDto.name,
      pin,
      description: createGameDto.description,
      initialBalance: createGameDto.initialBalance,
      maxPlayers: createGameDto.maxPlayers,
      maxTransfer,
      seasonalCollection,
      location: createGameDto.location,
      hasCommonFund: createGameDto.hasCommonFund,
    });

    // Agregar al creador como primer jugador
    await this.gamesRepository.addPlayer(game.id, userId, createGameDto.initialBalance);

    return game;
  }

  /**
   * Obtiene una partida por ID
   *
   * @param gameId - ID de la partida
   * @returns Partida con sus jugadores
   */
  async getGame(gameId: string): Promise<{
    game: Game;
    players: Array<{
      gameId: string;
      userId: string;
      username: string;
      avatar: string | null;
      currentBalance: string;
      createdAt: Date;
    }>;
  }> {
    const game = await this.gamesRepository.findById(gameId);

    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    const players = await this.gamesRepository.getPlayersWithData(gameId);

    return { game, players };
  }

  /**
   * Obtiene todas las partidas activas
   *
   * @returns Lista de partidas activas
   */
  async getActiveGames(): Promise<
    Array<
      Game & {
        playerCount: number;
      }
    >
  > {
    const games = await this.gamesRepository.findActive();

    // Obtener cantidad de jugadores para cada partida
    const gamesWithCount = await Promise.all(
      games.map(async (game) => {
        const playerCount = await this.gamesRepository.countPlayers(game.id);
        return { ...game, playerCount };
      }),
    );

    return gamesWithCount;
  }

  /**
   * Obtiene todas las partidas del usuario (creadas o en las que participa)
   *
   * @param userId - ID del usuario
   * @returns Lista de partidas del usuario
   */
  async getUserGames(userId: string): Promise<
    Array<
      Game & {
        playerCount: number;
      }
    >
  > {
    const games = await this.gamesRepository.findByUser(userId);

    // Obtener cantidad de jugadores para cada partida
    const gamesWithCount = await Promise.all(
      games.map(async (game) => {
        const playerCount = await this.gamesRepository.countPlayers(game.id);
        return { ...game, playerCount };
      }),
    );

    return gamesWithCount;
  }

  /**
   * Se une a una partida con PIN
   *
   * @param userId - ID del usuario que se une
   * @param joinGameDto - PIN de la partida
   * @returns Partida a la que se unió
   */
  async joinGame(userId: string, joinGameDto: JoinGameDto): Promise<Game> {
    // Buscar partida por PIN
    const game = await this.gamesRepository.findByPin(joinGameDto.pin.toUpperCase());

    if (!game) {
      throw new NotFoundException('Partida no encontrada. Verifica el PIN.');
    }

    // Verificar que la partida esté en estado "pending" o "active"
    if (game.status === 'finished') {
      throw new BadRequestException('La partida ha terminado');
    }

    // Verificar si el usuario ya está en la partida
    const isPlayerInGame = await this.gamesRepository.isPlayerInGame(game.id, userId);

    if (isPlayerInGame) {
      // Si ya está en la partida, simplemente retornar la partida
      // para que el frontend pueda navegarlo a la pantalla de detalles
      return game;
    }

    // Verificar que no se ha alcanzado el máximo de jugadores
    const playerCount = await this.gamesRepository.countPlayers(game.id);

    if (playerCount >= game.maxPlayers) {
      throw new BadRequestException('La partida está llena');
    }

    // Agregar jugador a la partida
    const initialBalance = parseFloat(game.initialBalance);
    await this.gamesRepository.addPlayer(game.id, userId, initialBalance);

    return game;
  }

  /**
   * Abandona una partida
   *
   * @param userId - ID del usuario
   * @param gameId - ID de la partida
   */
  async leaveGame(userId: string, gameId: string): Promise<void> {
    const game = await this.gamesRepository.findById(gameId);

    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    // Verificar que el usuario es creador de la partida
    if (game.createdBy === userId) {
      // Si es el creador, eliminar toda la partida
      await this.gamesRepository.delete(gameId);
    } else {
      // Si no es el creador, solo eliminar su participación
      await this.gamesRepository.removePlayer(gameId, userId);
    }
  }

  /**
   * Actualiza el estado de una partida
   *
   * @param gameId - ID de la partida
   * @param userId - ID del usuario (debe ser el creador)
   * @param status - Nuevo estado ('pending', 'active', 'finished')
   */
  async updateGameStatus(gameId: string, userId: string, status: string): Promise<Game | null> {
    const game = await this.gamesRepository.findById(gameId);

    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    if (game.createdBy !== userId) {
      throw new BadRequestException('Solo el creador puede cambiar el estado');
    }

    if (!['pending', 'active', 'finished'].includes(status)) {
      throw new BadRequestException('Estado inválido');
    }

    if (status === 'finished') {
      await this.gamesRepository.delete(gameId);
      return { ...game, status: 'finished' };
    }

    return this.gamesRepository.update(gameId, { status });
  }

  /**
   * Obtiene el balance actual de un jugador en una partida
   *
   * @param gameId - ID de la partida
   * @param userId - ID del usuario
   */
  async getPlayerBalance(gameId: string, userId: string): Promise<number> {
    const balance = await this.gamesRepository.getPlayerBalance(gameId, userId);

    if (balance === null) {
      throw new NotFoundException('Jugador no encontrado en la partida');
    }

    return balance;
  }

  /**
   * Actualiza el balance de un jugador
   * (Se usa desde el módulo de transacciones)
   *
   * @param gameId - ID de la partida
   * @param userId - ID del usuario
   * @param newBalance - Nuevo balance
   */
  async updatePlayerBalance(gameId: string, userId: string, newBalance: number): Promise<GamePlayer | null> {
    if (newBalance < 0) {
      throw new BadRequestException('El balance no puede ser negativo');
    }

    return this.gamesRepository.updatePlayerBalance(gameId, userId, newBalance);
  }
}
