/**
 * Servicio de Transacciones
 *
 * Maneja la lógica de:
 * - Transferencias entre jugadores
 * - Transferencias a la banca
 * - Retiradas de la banca
 * - Validación de saldos
 * - Historial de transacciones
 */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TransactionsRepository } from '../repositories/transactions.repository';
import { GamesRepository } from '@/modules/games/repositories/games.repository';
import { CreateTransactionDto, TransferToBankDto, WithdrawFromBankDto } from '../dto';
import { TransactionType, type Transaction } from '@/database/schema';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly gamesRepository: GamesRepository,
  ) {}

  /**
   * Realiza una transferencia entre dos jugadores
   *
   * @param senderId - ID del usuario que envía
   * @param createTransactionDto - Datos de la transacción
   * @returns Transacción creada
   */
  async transferBetweenPlayers(
    senderId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const { gameId, toUserId, amount, description } = createTransactionDto;

    // Validar que el monto sea positivo
    if (amount <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    // Validar que no sea la misma persona
    if (senderId === toUserId) {
      throw new BadRequestException('No puedes transferir dinero a ti mismo');
    }

    // Obtener la partida
    const game = await this.gamesRepository.findById(gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    // Verificar que ambos jugadores estén en la partida
    const senderInGame = await this.gamesRepository.isPlayerInGame(gameId, senderId);
    const receiverInGame = await this.gamesRepository.isPlayerInGame(gameId, toUserId);

    if (!senderInGame || !receiverInGame) {
      throw new BadRequestException('Uno o ambos jugadores no están en esta partida');
    }

    // Obtener balance del remitente
    const senderBalance = await this.gamesRepository.getPlayerBalance(gameId, senderId);

    if (senderBalance === null) {
      throw new NotFoundException('Balance del remitente no encontrado');
    }

    if (senderBalance < amount) {
      throw new ConflictException(
        `Saldo insuficiente. Tu balance es ${senderBalance}, intentas enviar ${amount}`,
      );
    }

    // Obtener balances actuales
    const receiverBalance = await this.gamesRepository.getPlayerBalance(gameId, toUserId);

    if (receiverBalance === null) {
      throw new NotFoundException('Balance del receptor no encontrado');
    }

    // Actualizar balances
    const newSenderBalance = senderBalance - amount;
    const newReceiverBalance = (receiverBalance || 0) + amount;

    await this.gamesRepository.updatePlayerBalance(gameId, senderId, newSenderBalance);
    await this.gamesRepository.updatePlayerBalance(gameId, toUserId, newReceiverBalance);

    // Registrar la transacción
    const transaction = await this.transactionsRepository.create({
      gameId,
      fromUserId: senderId,
      toUserId,
      amount,
      type: TransactionType.PLAYER_TO_PLAYER,
      description: description || `Transferencia de ${senderId} a ${toUserId}`,
    });

    return transaction;
  }

  /**
   * Transferencia de un jugador a la banca
   *
   * @param userId - ID del usuario
   * @param transferToBankDto - Datos de la transferencia
   * @returns Transacción creada
   */
  async transferToBank(userId: string, transferToBankDto: TransferToBankDto): Promise<Transaction> {
    const { gameId, amount, description } = transferToBankDto;

    // Validar que el monto sea positivo
    if (amount <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    // Obtener la partida
    const game = await this.gamesRepository.findById(gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    // Verificar que el usuario esté en la partida
    const isPlayerInGame = await this.gamesRepository.isPlayerInGame(gameId, userId);
    if (!isPlayerInGame) {
      throw new BadRequestException('No estás en esta partida');
    }

    // Obtener balance del jugador
    const playerBalance = await this.gamesRepository.getPlayerBalance(gameId, userId);

    if (playerBalance === null) {
      throw new NotFoundException('Balance no encontrado');
    }

    if (playerBalance < amount) {
      throw new ConflictException(
        `Saldo insuficiente. Tu balance es ${playerBalance}, intentas enviar ${amount}`,
      );
    }

    // Actualizar balance del jugador
    const newPlayerBalance = playerBalance - amount;
    await this.gamesRepository.updatePlayerBalance(gameId, userId, newPlayerBalance);

    // Registrar la transacción
    const transaction = await this.transactionsRepository.create({
      gameId,
      fromUserId: userId,
      toUserId: null,
      amount,
      type: TransactionType.PLAYER_TO_BANK,
      description: description || `Pago a la banca: ${amount}`,
    });

    return transaction;
  }

  /**
   * Retirada de la banca para un jugador
   *
   * Solo el creador de la partida puede hacer esto
   *
   * @param userId - ID del usuario (debe ser creador)
   * @param withdrawFromBankDto - Datos de la retirada
   * @returns Transacción creada
   */
  async withdrawFromBank(userId: string, withdrawFromBankDto: WithdrawFromBankDto): Promise<Transaction> {
    const { gameId, toUserId, amount, description } = withdrawFromBankDto;

    // Validar que el monto sea positivo
    if (amount <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    // Obtener la partida
    const game = await this.gamesRepository.findById(gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    // Verificar que el usuario es el creador
    if (game.createdBy !== userId) {
      throw new BadRequestException('Solo el creador de la partida puede hacer retiradas de la banca');
    }

    // Verificar que el destinatario esté en la partida
    const isReceiverInGame = await this.gamesRepository.isPlayerInGame(gameId, toUserId);
    if (!isReceiverInGame) {
      throw new BadRequestException('El jugador seleccionado no está en esta partida');
    }

    // Obtener balance del jugador que recibe
    const playerBalance = await this.gamesRepository.getPlayerBalance(gameId, toUserId);

    if (playerBalance === null) {
      throw new NotFoundException('Balance no encontrado');
    }

    // Actualizar balance del jugador
    const newPlayerBalance = playerBalance + amount;
    await this.gamesRepository.updatePlayerBalance(gameId, toUserId, newPlayerBalance);

    // Registrar la transacción
    const transaction = await this.transactionsRepository.create({
      gameId,
      fromUserId: null,
      toUserId,
      amount,
      type: TransactionType.BANK_TO_PLAYER,
      description: description || `Retirada de la banca: ${amount}`,
    });

    return transaction;
  }

  /**
   * Obtiene el historial de transacciones de una partida
   *
   * @param gameId - ID de la partida
   * @returns Historial con datos de usuarios
   */
  async getGameTransactionHistory(gameId: string) {
    // Verificar que la partida existe
    const game = await this.gamesRepository.findById(gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    return this.transactionsRepository.getGameTransactionHistory(gameId);
  }

  /**
   * Obtiene las transacciones de un usuario en una partida
   *
   * @param gameId - ID de la partida
   * @param userId - ID del usuario
   * @returns Lista de transacciones del usuario
   */
  async getUserTransactionsInGame(gameId: string, userId: string): Promise<Transaction[]> {
    // Verificar que la partida existe
    const game = await this.gamesRepository.findById(gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    // Verificar que el usuario está en la partida
    const isPlayerInGame = await this.gamesRepository.isPlayerInGame(gameId, userId);
    if (!isPlayerInGame) {
      throw new BadRequestException('No estás en esta partida');
    }

    return this.transactionsRepository.findByUserInGame(gameId, userId);
  }

  /**
   * Obtiene el balance de la banca en una partida
   *
   * @param gameId - ID de la partida
   * @returns Balance de la banca
   */
  async getBankBalance(gameId: string): Promise<number> {
    // Verificar que la partida existe
    const game = await this.gamesRepository.findById(gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    return this.transactionsRepository.calculateBankBalance(gameId);
  }

  /**
   * Obtiene el resumen financiero de una partida
   *
   * @param gameId - ID de la partida
   * @returns Resumen con saldos de todos los jugadores y banca
   */
  async getGameFinancialSummary(gameId: string) {
    // Verificar que la partida existe
    const game = await this.gamesRepository.findById(gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    // Obtener todos los jugadores con balances
    const playersWithData = await this.gamesRepository.getPlayersWithData(gameId);

    // Calcular balance de la banca
    const bankBalance = await this.transactionsRepository.calculateBankBalance(gameId);

    // Calcular total en circulación
    const totalPlayerBalance = playersWithData.reduce(
      (sum, player) => sum + parseFloat(player.currentBalance),
      0,
    );

    return {
      gameId,
      gameName: game.name,
      status: game.status,
      players: playersWithData.map((p) => ({
        userId: p.userId,
        username: p.username,
        avatar: p.avatar,
        balance: parseFloat(p.currentBalance),
      })),
      bankBalance,
      totalBalance: totalPlayerBalance + bankBalance,
      playerCount: playersWithData.length,
      maxPlayers: game.maxPlayers,
    };
  }
}
