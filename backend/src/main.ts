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

  // Self-ping mechanism to keep Render free tier alive
  const selfUrl = process.env.SELF_URL;
  if (selfUrl) {
    console.log(`💓 Heartbeat: ACTIVE (Pinging ${selfUrl}/health every 14 min)`);
    setInterval(() => {
      fetch(`${selfUrl}/health`)
        .then(res => {
          if (!res.ok) console.error(`[Heartbeat] Failed with status: ${res.status}`);
        })
        .catch(err => console.error(`[Heartbeat] Error: ${err.message}`));
    }, 14 * 60 * 1000); // 14 minutes
  }
}

bootstrap().catch(error => {
  console.error('Failed to initialize application', error.message);
  process.exit(1);
});
