/**
 * Decorador @CurrentUser()
 *
 * Facilita obtener el usuario autenticado en los controladores
 *
 * Uso:
 * @Get('/profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User } from '@/database/schema';

/**
 * Extrae el usuario del request (inyectado por JwtStrategy)
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user || null;
  },
);
