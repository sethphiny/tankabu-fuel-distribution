"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
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
//# sourceMappingURL=main.js.map