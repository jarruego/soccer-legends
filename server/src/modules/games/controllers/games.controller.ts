/**
 * Controlador de Games (Partidas)
 *
 * Endpoints:
 * - POST /games - Crear nueva partida
 * - GET /games/:id - Obtener detalles de partida
 * - GET /games - Obtener partidas del usuario
 * - GET /games/active - Obtener partidas activas
 * - POST /games/join - Unirse a una partida
 * - DELETE /games/:id - Abandonar/eliminar partida
 * - PATCH /games/:id/status - Cambiar estado
 * - GET /games/:id/balance/:userId - Obtener balance del jugador
 */

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GamesService } from '../services/games.service';
import { CreateGameDto, JoinGameDto, UpdateGameDto } from '../dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { User } from '@/database/schema';

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  /**
   * Se une a una partida con PIN (RUTA ESPECÍFICA - DEBE IR PRIMERO)
   *
   * @route POST /games/join
   * @body JoinGameDto - PIN de la partida
   * @returns Confirmación de unión
   */
  @Post('join')
  @HttpCode(HttpStatus.OK)
  async joinGame(@CurrentUser() user: User, @Body() joinGameDto: JoinGameDto) {
    const game = await this.gamesService.joinGame(user.id, joinGameDto);

    return {
      id: game.id,
      name: game.name,
      pin: game.pin,
      message: `Te has unido a la partida "${game.name}"`,
    };
  }

  /**
   * Obtiene todas las partidas activas disponibles (RUTA ESPECÍFICA)
   *
   * @route GET /games/available - Obtener partidas disponibles
   * @returns Lista de partidas activas
   */
  @Get('available')
  @HttpCode(HttpStatus.OK)
  async getActiveGames() {
    const games = await this.gamesService.getActiveGames();

    return games.map((game) => ({
      id: game.id,
      name: game.name,
      status: game.status,
      playerCount: game.playerCount,
      maxPlayers: game.maxPlayers,
      location: game.location,
    }));
  }

  /**
   * Crea una nueva partida
   *
   * @route POST /games
   * @body CreateGameDto - Datos de la partida
   * @returns Partida creada con PIN
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGame(@CurrentUser() user: User, @Body() createGameDto: CreateGameDto) {
    const game = await this.gamesService.createGame(user.id, createGameDto);

    return {
      id: game.id,
      pin: game.pin,
      name: game.name,
      message: `Partida "${game.name}" creada. PIN: ${game.pin}`,
    };
  }

  /**
   * Obtiene todas las partidas del usuario autenticado
   *
   * @route GET /games
   * @returns Lista de partidas del usuario
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserGames(@CurrentUser() user: User) {
    const games = await this.gamesService.getUserGames(user.id);

    return games.map((game) => ({
      id: game.id,
      name: game.name,
      status: game.status,
      pin: game.pin,
      initialBalance: game.initialBalance,
      playerCount: game.playerCount,
      maxPlayers: game.maxPlayers,
      createdAt: game.createdAt,
    }));
  }

  /**
   * Obtiene una partida específica con todos sus jugadores (RUTA PARAMETRIZADA - VA AL FINAL)
   *
   * @route GET /games/:id
   * @param id - ID de la partida
   * @returns Datos de la partida con lista de jugadores
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getGame(@Param('id') id: string) {
    const { game, players } = await this.gamesService.getGame(id);

    return {
      id: game.id,
      name: game.name,
      description: game.description,
      pin: game.pin,
      status: game.status,
      initialBalance: game.initialBalance,
      maxPlayers: game.maxPlayers,
      location: game.location,
      createdBy: game.createdBy,
      playerCount: players.length,
      players: players.map((p) => ({
        userId: p.userId,
        username: p.username,
        avatar: p.avatar,
        currentBalance: p.currentBalance,
      })),
      createdAt: game.createdAt,
    };
  }

  /**
   * Abandona una partida o la elimina (si eres el creador)
   *
   * @route DELETE /games/:id
   * @param id - ID de la partida
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveGame(@CurrentUser() user: User, @Param('id') id: string) {
    await this.gamesService.leaveGame(user.id, id);
  }

  /**
   * Cambia el estado de una partida
   *
   * Solo el creador puede hacerlo
   *
   * @route PATCH /games/:id/status
   * @param id - ID de la partida
   * @body { status: 'pending' | 'active' | 'finished' }
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: { status: string },
  ) {
    const game = await this.gamesService.updateGameStatus(id, user.id, updateDto.status);

    return {
      id: game?.id,
      status: game?.status,
      message: `Estado de la partida actualizado a: ${game?.status}`,
    };
  }

  /**
   * Obtiene el balance actual de un jugador
   *
   * @route GET /games/:id/balance/:userId
   */
  @Get(':gameId/balance/:userId')
  @HttpCode(HttpStatus.OK)
  async getPlayerBalance(
    @Param('gameId') gameId: string,
    @Param('userId') userId: string,
  ) {
    const balance = await this.gamesService.getPlayerBalance(gameId, userId);

    return {
      gameId,
      userId,
      balance,
    };
  }
}
