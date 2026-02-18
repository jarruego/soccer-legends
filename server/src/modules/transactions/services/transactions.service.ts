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
import {
  CreateTransactionDto,
  TransferToBankDto,
  TransferToCommonFundDto,
  WithdrawFromBankDto,
} from '../dto';
import { CommonFundClaimStatus, TransactionType, type Transaction } from '@/database/schema';

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
   * Transferencia de un jugador al Fondo Común
   */
  async transferToCommonFund(
    userId: string,
    transferToCommonFundDto: TransferToCommonFundDto,
  ): Promise<Transaction> {
    const { gameId, amount, description } = transferToCommonFundDto;

    if (amount <= 0) {
      throw new BadRequestException('El monto debe ser mayor a 0');
    }

    const game = await this.gamesRepository.findById(gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    if (!game.hasCommonFund) {
      throw new BadRequestException('Esta partida no tiene Fondo Común habilitado');
    }

    const isPlayerInGame = await this.gamesRepository.isPlayerInGame(gameId, userId);
    if (!isPlayerInGame) {
      throw new BadRequestException('No estás en esta partida');
    }

    const playerBalance = await this.gamesRepository.getPlayerBalance(gameId, userId);
    if (playerBalance === null) {
      throw new NotFoundException('Balance no encontrado');
    }

    if (playerBalance < amount) {
      throw new ConflictException(
        `Saldo insuficiente. Tu balance es ${playerBalance}, intentas enviar ${amount}`,
      );
    }

    const newPlayerBalance = playerBalance - amount;
    await this.gamesRepository.updatePlayerBalance(gameId, userId, newPlayerBalance);

    const transaction = await this.transactionsRepository.create({
      gameId,
      fromUserId: userId,
      toUserId: null,
      amount,
      type: TransactionType.PLAYER_TO_COMMON_FUND,
      description: description || `Aporte al Fondo Común: ${amount}`,
    });

    return transaction;
  }

  /**
   * Solicita quedarse con todo el Fondo Común
   */
  async requestCommonFundClaim(userId: string, gameId: string) {
    const game = await this.gamesRepository.findById(gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    if (!game.hasCommonFund) {
      throw new BadRequestException('Esta partida no tiene Fondo Común habilitado');
    }

    const isPlayerInGame = await this.gamesRepository.isPlayerInGame(gameId, userId);
    if (!isPlayerInGame) {
      throw new BadRequestException('No estás en esta partida');
    }

    const commonFundBalance = await this.transactionsRepository.calculateCommonFundBalance(gameId);
    if (commonFundBalance <= 0) {
      throw new BadRequestException('El Fondo Común está vacío');
    }

    const existingPending = await this.transactionsRepository.findPendingCommonFundClaimByGame(gameId);
    if (existingPending) {
      throw new ConflictException('Ya existe una solicitud pendiente del Fondo Común');
    }

    const claim = await this.transactionsRepository.createCommonFundClaim(gameId, userId);

    if (game.createdBy === userId) {
      const requesterBalance = await this.gamesRepository.getPlayerBalance(gameId, userId);
      if (requesterBalance === null) {
        throw new NotFoundException('Jugador solicitante no encontrado en la partida');
      }

      await this.gamesRepository.updatePlayerBalance(gameId, userId, requesterBalance + commonFundBalance);

      await this.transactionsRepository.create({
        gameId,
        fromUserId: null,
        toUserId: userId,
        amount: commonFundBalance,
        type: TransactionType.COMMON_FUND_TO_PLAYER,
        description: `Cobro directo del Fondo Común por la banca: ${commonFundBalance}`,
      });

      const resolved = await this.transactionsRepository.resolveCommonFundClaim(
        claim.id,
        CommonFundClaimStatus.APPROVED,
        userId,
      );

      return {
        ...resolved,
        autoApproved: true,
        amount: commonFundBalance,
      };
    }

    return {
      ...claim,
      autoApproved: false,
      amount: commonFundBalance,
    };
  }

  /**
   * Obtiene solicitudes pendientes del Fondo Común
   */
  async getPendingCommonFundClaims(userId: string, gameId: string) {
    const game = await this.gamesRepository.findById(gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    if (game.createdBy !== userId) {
      throw new BadRequestException('Solo la banca puede ver solicitudes pendientes');
    }

    return this.transactionsRepository.findPendingCommonFundClaimsWithUser(gameId);
  }

  /**
   * Obtiene la última solicitud del usuario en una partida
   */
  async getMyLatestCommonFundClaim(userId: string, gameId: string) {
    const game = await this.gamesRepository.findById(gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    const isPlayerInGame = await this.gamesRepository.isPlayerInGame(gameId, userId);
    if (!isPlayerInGame) {
      throw new BadRequestException('No estás en esta partida');
    }

    return this.transactionsRepository.findLatestCommonFundClaimByRequester(gameId, userId);
  }

  /**
   * Aprueba una solicitud del Fondo Común y transfiere todo el fondo al solicitante
   */
  async approveCommonFundClaim(userId: string, claimId: string) {
    const claim = await this.transactionsRepository.findCommonFundClaimById(claimId);
    if (!claim) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    const game = await this.gamesRepository.findById(claim.gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    if (game.createdBy !== userId) {
      throw new BadRequestException('Solo la banca puede aprobar solicitudes del Fondo Común');
    }

    if (claim.status !== CommonFundClaimStatus.PENDING) {
      throw new ConflictException('La solicitud ya fue resuelta');
    }

    const commonFundBalance = await this.transactionsRepository.calculateCommonFundBalance(claim.gameId);
    if (commonFundBalance <= 0) {
      throw new BadRequestException('No hay saldo en el Fondo Común');
    }

    const requesterBalance = await this.gamesRepository.getPlayerBalance(claim.gameId, claim.requesterUserId);
    if (requesterBalance === null) {
      throw new NotFoundException('Jugador solicitante no encontrado en la partida');
    }

    await this.gamesRepository.updatePlayerBalance(
      claim.gameId,
      claim.requesterUserId,
      requesterBalance + commonFundBalance,
    );

    await this.transactionsRepository.create({
      gameId: claim.gameId,
      fromUserId: null,
      toUserId: claim.requesterUserId,
      amount: commonFundBalance,
      type: TransactionType.COMMON_FUND_TO_PLAYER,
      description: `Entrega del Fondo Común: ${commonFundBalance}`,
    });

    const resolved = await this.transactionsRepository.resolveCommonFundClaim(
      claim.id,
      CommonFundClaimStatus.APPROVED,
      userId,
    );

    return { claim: resolved, amount: commonFundBalance };
  }

  /**
   * Rechaza una solicitud del Fondo Común
   */
  async rejectCommonFundClaim(userId: string, claimId: string) {
    const claim = await this.transactionsRepository.findCommonFundClaimById(claimId);
    if (!claim) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    const game = await this.gamesRepository.findById(claim.gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    if (game.createdBy !== userId) {
      throw new BadRequestException('Solo la banca puede rechazar solicitudes del Fondo Común');
    }

    if (claim.status !== CommonFundClaimStatus.PENDING) {
      throw new ConflictException('La solicitud ya fue resuelta');
    }

    return this.transactionsRepository.resolveCommonFundClaim(
      claim.id,
      CommonFundClaimStatus.REJECTED,
      userId,
    );
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
   * Obtiene el balance del Fondo Común en una partida
   */
  async getCommonFundBalance(gameId: string): Promise<number> {
    const game = await this.gamesRepository.findById(gameId);
    if (!game) {
      throw new NotFoundException('Partida no encontrada');
    }

    if (!game.hasCommonFund) {
      return 0;
    }

    return this.transactionsRepository.calculateCommonFundBalance(gameId);
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
    const commonFundBalance = game.hasCommonFund
      ? await this.transactionsRepository.calculateCommonFundBalance(gameId)
      : 0;

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
      hasCommonFund: game.hasCommonFund,
      bankBalance,
      commonFundBalance,
      totalBalance: totalPlayerBalance + bankBalance + commonFundBalance,
      playerCount: playersWithData.length,
      maxPlayers: game.maxPlayers,
      maxTransfer: game.maxTransfer,
    };
  }
}
