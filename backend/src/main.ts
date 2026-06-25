import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security Headers
  app.use(helmet());
  
  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: true, // throw error if unknown properties are present
      transform: true, // automatically transform payloads to DTO instances
    }),
  );

  app.setGlobalPrefix('api/v1');
  
  // CORS Configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // Restrict to frontend URL in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}
bootstrap();
