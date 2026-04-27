"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.DatabaseSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/dbname',
    entities: [__dirname + '/../**/*.schema{.ts,.js}'],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    synchronize: false,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    logging: true,
});
exports.default = exports.DatabaseSource;
//# sourceMappingURL=data-source.js.map