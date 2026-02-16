/**
 * Controlador de Transacciones
 *
 * Endpoints:
 * - POST /transactions/transfer - Transferencia entre jugadores
 * - POST /transactions/to-bank - Transferencia a la banca
 * - POST /transactions/withdraw - Retirada de la banca
 * - GET /transactions/:gameId - Historial de transacciones
 * - GET /transactions/:gameId/my-transactions - Mis transacciones
 * - GET /transactions/:gameId/bank-balance - Balance de la banca
 * - GET /transactions/:gameId/summary - Resumen financiero
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransactionsService } from '../services/transactions.service';
import { CreateTransactionDto, TransferToBankDto, WithdrawFromBankDto } from '../dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import type { User } from '@/database/schema';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Realiza una transferencia entre dos jugadores
   *
   * @route POST /transactions/transfer
   * @body CreateTransactionDto - Datos de la transacción
   * @returns Transacción registrada
   */
  @Post('transfer')
  @HttpCode(HttpStatus.CREATED)
  async transferBetweenPlayers(
    @CurrentUser() user: User,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const transaction = await this.transactionsService.transferBetweenPlayers(
      user.id,
      createTransactionDto,
    );

    return {
      id: transaction.id,
      gameId: transaction.gameId,
      fromUserId: transaction.fromUserId,
      toUserId: transaction.toUserId,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      createdAt: transaction.createdAt,
      message: `Transferencia de ${transaction.amount} completada`,
    };
  }

  /**
   * Realiza una transferencia a la banca
   *
   * @route POST /transactions/to-bank
   * @body TransferToBankDto - Monto y descripción
   * @returns Transacción registrada
   */
  @Post('to-bank')
  @HttpCode(HttpStatus.CREATED)
  async transferToBank(
    @CurrentUser() user: User,
    @Body() transferToBankDto: TransferToBankDto,
  ) {
    const transaction = await this.transactionsService.transferToBank(
      user.id,
      transferToBankDto,
    );

    return {
      id: transaction.id,
      gameId: transaction.gameId,
      amount: transaction.amount,
      type: transaction.type,
      createdAt: transaction.createdAt,
      message: `${transaction.amount} transferido a la banca`,
    };
  }

  /**
   * Realiza una retirada de la banca
   *
   * Solo el creador puede hacerlo
   *
   * @route POST /transactions/withdraw
   * @body WithdrawFromBankDto - Monto y descripción
   * @returns Transacción registrada
   */
  @Post('withdraw')
  @HttpCode(HttpStatus.CREATED)
  async withdrawFromBank(
    @CurrentUser() user: User,
    @Body() withdrawFromBankDto: WithdrawFromBankDto,
  ) {
    const transaction = await this.transactionsService.withdrawFromBank(
      user.id,
      withdrawFromBankDto,
    );

    return {
      id: transaction.id,
      gameId: transaction.gameId,
      amount: transaction.amount,
      type: transaction.type,
      createdAt: transaction.createdAt,
      message: `${transaction.amount} retirado de la banca`,
    };
  }

  /**
   * Obtiene el historial completo de transacciones de una partida
   *
   * @route GET /transactions/:gameId
   * @param gameId - ID de la partida
   * @returns Historial de transacciones
   */
  @Get(':gameId')
  @HttpCode(HttpStatus.OK)
  async getGameTransactionHistory(
    @CurrentUser() user: User,
    @Param('gameId') gameId: string,
  ) {
    const transactions = await this.transactionsService.getGameTransactionHistory(gameId);

    return {
      gameId,
      transactionCount: transactions.length,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        from: tx.fromUser ? tx.fromUser.username : 'Banca',
        to: tx.toUser ? tx.toUser.username : 'Banca',
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        createdAt: tx.createdAt,
      })),
    };
  }

  /**
   * Obtiene las transacciones del usuario actual en una partida
   *
   * @route GET /transactions/:gameId/my-transactions
   * @param gameId - ID de la partida
   * @returns Transacciones del usuario
   */
  @Get(':gameId/my-transactions')
  @HttpCode(HttpStatus.OK)
  async getUserTransactions(
    @CurrentUser() user: User,
    @Param('gameId') gameId: string,
  ) {
    const transactions = await this.transactionsService.getUserTransactionsInGame(
      gameId,
      user.id,
    );

    return {
      gameId,
      userId: user.id,
      transactionCount: transactions.length,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        fromUserId: tx.fromUserId,
        toUserId: tx.toUserId,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        createdAt: tx.createdAt,
      })),
    };
  }

  /**
   * Obtiene el balance actual de la banca
   *
   * @route GET /transactions/:gameId/bank-balance
   * @param gameId - ID de la partida
   * @returns Balance de la banca
   */
  @Get(':gameId/bank-balance')
  @HttpCode(HttpStatus.OK)
  async getBankBalance(
    @CurrentUser() user: User,
    @Param('gameId') gameId: string,
  ) {
    const bankBalance = await this.transactionsService.getBankBalance(gameId);

    return {
      gameId,
      bankBalance,
      message: `Balance actual de la banca: ${bankBalance}`,
    };
  }

  /**
   * Obtiene el resumen financiero completo de la partida
   *
   * Incluye saldos de todos los jugadores y la banca
   *
   * @route GET /transactions/:gameId/summary
   * @param gameId - ID de la partida
   * @returns Resumen financiero
   */
  @Get(':gameId/summary')
  @HttpCode(HttpStatus.OK)
  async getFinancialSummary(
    @CurrentUser() user: User,
    @Param('gameId') gameId: string,
  ) {
    const summary = await this.transactionsService.getGameFinancialSummary(gameId);

    return {
      ...summary,
      players: summary.players.map((p) => ({
        username: p.username,
        avatar: p.avatar,
        balance: p.balance,
      })),
    };
  }
}
