import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Root route for compatibility
  const server = app.getHttpAdapter();
  server.get('/', (req, res) => res.send('Fuel Distribution API v2.5 (NestJS) - Status: ONLINE'));
  server.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 NestJS Backend running on: http://localhost:${port}`);
}
bootstrap();
