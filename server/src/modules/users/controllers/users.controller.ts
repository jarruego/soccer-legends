import { Controller, Get, Param, UseGuards, HttpCode, HttpStatus, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TransactionsService } from '../../transactions/services/transactions.service';
import { UsersService } from '../services/users.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { User } from '@/database/schema';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
  ) {}
  /**
   * Elimina la cuenta del usuario autenticado y todos sus datos asociados
   * @route DELETE /users/me
   */
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@CurrentUser() user: User) {
    await this.usersService.deleteUserAndData(user.id);
    return;
  }

  /**
   * Obtiene todas las transacciones de un usuario (todas las partidas)
   * @route GET /users/:userId/transactions
   */
  @Get(':userId/transactions')
  @HttpCode(HttpStatus.OK)
  async getUserTransactions(
    @CurrentUser() user: User,
    @Param('userId') userId: string,
  ) {
    // Solo el propio usuario puede ver sus transacciones
    if (user.id !== userId) {
      return { statusCode: 403, message: 'No autorizado' };
    }
    return this.transactionsService.getAllUserTransactions(userId);
  }
}
