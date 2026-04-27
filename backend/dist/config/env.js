"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = void 0;
const envConfig = () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
        url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/fuel_tracker',
    },
    api: {
        key: process.env.BACKEND_API_KEY || '',
    },
});
exports.envConfig = envConfig;
//# sourceMappingURL=env.js.map