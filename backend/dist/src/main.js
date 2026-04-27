"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    const server = app.getHttpAdapter();
    server.get('/', (req, res) => res.send('Fuel Distribution API v2.5 (NestJS) - Status: ONLINE'));
    server.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 NestJS Backend running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map