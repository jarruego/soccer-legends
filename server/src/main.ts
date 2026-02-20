/**
 * Punto de entrada de la aplicación NestJS
 *
 * Aquí se configura e inicia la aplicación.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';


async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Middleware global para loguear todas las peticiones entrantes

  // Habilitar CORS para el cliente (Expo y web)
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:8081')
    .split(',')
    .map(origin => origin.trim());
  console.log('🌐 CORS habilitado para:', allowedOrigins);
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no declaradas
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extras
      transform: true, // Transforma los datos al tipo correcto
      transformOptions: {
        enableImplicitConversion: true, // Convierte tipos automáticamente
      },
    }),
  );

  const port = parseInt(process.env.PORT || '3000');
  await app.listen(port);

  console.log(`✅ Servidor ejecutándose en http://localhost:${port}`);
  console.log(`📝 API disponible en http://localhost:${port}/api`);
  console.log(`🔍 Swagger disponible en http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('❌ Error iniciando aplicación:', err);
  process.exit(1);
});
