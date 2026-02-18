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
import {
  CreateTransactionDto,
  TransferToBankDto,
  TransferToCommonFundDto,
  WithdrawFromBankDto,
} from '../dto';
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
   * Realiza una transferencia de un jugador al Fondo Común
   *
   * @route POST /transactions/to-common-fund
   */
  @Post('to-common-fund')
  @HttpCode(HttpStatus.CREATED)
  async transferToCommonFund(
    @CurrentUser() user: User,
    @Body() transferToCommonFundDto: TransferToCommonFundDto,
  ) {
    const transaction = await this.transactionsService.transferToCommonFund(
      user.id,
      transferToCommonFundDto,
    );

    return {
      id: transaction.id,
      gameId: transaction.gameId,
      amount: transaction.amount,
      type: transaction.type,
      createdAt: transaction.createdAt,
      message: `${transaction.amount} transferido al Fondo Común`,
    };
  }

  /**
   * Solicita quedarse con todo el Fondo Común
   *
   * @route POST /transactions/:gameId/common-fund-claims/request
   */
  @Post(':gameId/common-fund-claims/request')
  @HttpCode(HttpStatus.CREATED)
  async requestCommonFundClaim(
    @CurrentUser() user: User,
    @Param('gameId') gameId: string,
  ) {
    const claim = await this.transactionsService.requestCommonFundClaim(user.id, gameId);

    return {
      id: claim.id,
      gameId: claim.gameId,
      requesterUserId: claim.requesterUserId,
      status: claim.status,
      createdAt: claim.createdAt,
      autoApproved: !!claim.autoApproved,
      amount: claim.amount || 0,
      message: claim.autoApproved
        ? 'Fondo Común transferido al instante (banca)'
        : 'Solicitud enviada a la banca',
    };
  }

  /**
   * Solicita recaudacion por temporada
   *
   * @route POST /transactions/:gameId/seasonal-collection-claims/request
   */
  @Post(':gameId/seasonal-collection-claims/request')
  @HttpCode(HttpStatus.CREATED)
  async requestSeasonalCollectionClaim(
    @CurrentUser() user: User,
    @Param('gameId') gameId: string,
  ) {
    const claim = await this.transactionsService.requestSeasonalCollectionClaim(user.id, gameId);

    return {
      id: claim.id,
      gameId: claim.gameId,
      requesterUserId: claim.requesterUserId,
      status: claim.status,
      createdAt: claim.createdAt,
      amount: claim.amount,
      message: 'Solicitud de recaudación enviada a la banca',
    };
  }

  /**
   * Obtiene solicitudes pendientes de recaudacion (solo banca)
   *
   * @route GET /transactions/:gameId/seasonal-collection-claims/pending
   */
  @Get(':gameId/seasonal-collection-claims/pending')
  @HttpCode(HttpStatus.OK)
  async getPendingSeasonalCollectionClaims(
    @CurrentUser() user: User,
    @Param('gameId') gameId: string,
  ) {
    const claims = await this.transactionsService.getPendingSeasonalCollectionClaims(user.id, gameId);

    return {
      gameId,
      claimCount: claims.length,
      claims,
    };
  }

  /**
   * Obtiene mi ultima solicitud de recaudacion
   *
   * @route GET /transactions/:gameId/seasonal-collection-claims/my-latest
   */
  @Get(':gameId/seasonal-collection-claims/my-latest')
  @HttpCode(HttpStatus.OK)
  async getMyLatestSeasonalCollectionClaim(
    @CurrentUser() user: User,
    @Param('gameId') gameId: string,
  ) {
    const claim = await this.transactionsService.getMyLatestSeasonalCollectionClaim(user.id, gameId);

    return {
      gameId,
      claim,
    };
  }

  /**
   * Aprueba una solicitud de recaudacion (solo banca)
   *
   * @route POST /transactions/seasonal-collection-claims/:claimId/approve
   */
  @Post('seasonal-collection-claims/:claimId/approve')
  @HttpCode(HttpStatus.OK)
  async approveSeasonalCollectionClaim(
    @CurrentUser() user: User,
    @Param('claimId') claimId: string,
  ) {
    const result = await this.transactionsService.approveSeasonalCollectionClaim(user.id, claimId);

    return {
      claim: result.claim,
      amount: result.amount,
      message: `Solicitud aprobada. Se transfirieron ${result.amount} de recaudación.`,
    };
  }

  /**
   * Rechaza una solicitud de recaudacion (solo banca)
   *
   * @route POST /transactions/seasonal-collection-claims/:claimId/reject
   */
  @Post('seasonal-collection-claims/:claimId/reject')
  @HttpCode(HttpStatus.OK)
  async rejectSeasonalCollectionClaim(
    @CurrentUser() user: User,
    @Param('claimId') claimId: string,
  ) {
    const claim = await this.transactionsService.rejectSeasonalCollectionClaim(user.id, claimId);

    return {
      claim,
      message: 'Solicitud rechazada',
    };
  }

  /**
   * Obtiene solicitudes pendientes del Fondo Común (solo banca)
   *
   * @route GET /transactions/:gameId/common-fund-claims/pending
   */
  @Get(':gameId/common-fund-claims/pending')
  @HttpCode(HttpStatus.OK)
  async getPendingCommonFundClaims(
    @CurrentUser() user: User,
    @Param('gameId') gameId: string,
  ) {
    const claims = await this.transactionsService.getPendingCommonFundClaims(user.id, gameId);

    return {
      gameId,
      claimCount: claims.length,
      claims,
    };
  }

  /**
   * Obtiene mi última solicitud del Fondo Común
   *
   * @route GET /transactions/:gameId/common-fund-claims/my-latest
   */
  @Get(':gameId/common-fund-claims/my-latest')
  @HttpCode(HttpStatus.OK)
  async getMyLatestCommonFundClaim(
    @CurrentUser() user: User,
    @Param('gameId') gameId: string,
  ) {
    const claim = await this.transactionsService.getMyLatestCommonFundClaim(user.id, gameId);

    return {
      gameId,
      claim,
    };
  }

  /**
   * Aprueba una solicitud del Fondo Común (solo banca)
   *
   * @route POST /transactions/common-fund-claims/:claimId/approve
   */
  @Post('common-fund-claims/:claimId/approve')
  @HttpCode(HttpStatus.OK)
  async approveCommonFundClaim(
    @CurrentUser() user: User,
    @Param('claimId') claimId: string,
  ) {
    const result = await this.transactionsService.approveCommonFundClaim(user.id, claimId);

    return {
      claim: result.claim,
      amount: result.amount,
      message: `Solicitud aprobada. Se transfirieron ${result.amount} del Fondo Común.`,
    };
  }

  /**
   * Rechaza una solicitud del Fondo Común (solo banca)
   *
   * @route POST /transactions/common-fund-claims/:claimId/reject
   */
  @Post('common-fund-claims/:claimId/reject')
  @HttpCode(HttpStatus.OK)
  async rejectCommonFundClaim(
    @CurrentUser() user: User,
    @Param('claimId') claimId: string,
  ) {
    const claim = await this.transactionsService.rejectCommonFundClaim(user.id, claimId);

    return {
      claim,
      message: 'Solicitud rechazada',
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
        fromUserId: tx.fromUser ? tx.fromUser.id : null,
        toUserId: tx.toUser ? tx.toUser.id : null,
        fromUsername: tx.fromUser ? tx.fromUser.username : null,
        toUsername: tx.toUser ? tx.toUser.username : null,
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
   * Obtiene el balance actual del Fondo Común
   *
   * @route GET /transactions/:gameId/common-fund-balance
   */
  @Get(':gameId/common-fund-balance')
  @HttpCode(HttpStatus.OK)
  async getCommonFundBalance(
    @CurrentUser() user: User,
    @Param('gameId') gameId: string,
  ) {
    const commonFundBalance = await this.transactionsService.getCommonFundBalance(gameId);

    return {
      gameId,
      commonFundBalance,
      message: `Balance actual del Fondo Común: ${commonFundBalance}`,
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
