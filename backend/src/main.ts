import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Root route and health check
  const server = app.getHttpAdapter();
  server.get('/', (req, res) => res.send('Fuel Distribution API v2.6 (NestJS Postgres) - Status: ONLINE'));
  server.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 NestJS MVP Backend running on port ${port}`);
}

bootstrap().catch(error => {
  console.error('Failed to initialize application', error.message);
  process.exit(1);
});
