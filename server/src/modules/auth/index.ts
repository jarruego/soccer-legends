// Exportar servicios
export { AuthService } from './services/auth.service';

// Exportar controladores
export { AuthController } from './controllers/auth.controller';

// Exportar guards
export { JwtAuthGuard } from './guards/jwt-auth.guard';

// Exportar strategies
export { JwtStrategy } from './strategies/jwt.strategy';

// Exportar decoradores
export { CurrentUser } from './decorators/current-user.decorator';

// Exportar DTOs
export * from './dto';

// Exportar módulo
export { AuthModule } from './auth.module';
