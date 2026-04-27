"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const config_1 = require("@nestjs/config");
let ShipmentsService = class ShipmentsService {
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        const dbPath = this.configService.get('DATABASE_URL') || 'fuel_tracker.db';
        this.db = new better_sqlite3_1.default(dbPath);
        this.initDb();
    }
    initDb() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS shipments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        manifest_id TEXT UNIQUE,
        product_type TEXT,
        volume REAL,
        price REAL,
        station_address TEXT,
        driver_address TEXT,
        status TEXT DEFAULT 'DISPATCHED',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS checkpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        shipment_id TEXT,
        name TEXT,
        location TEXT,
        status TEXT,
        volume_recorded REAL,
        variance REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(shipment_id) REFERENCES shipments(manifest_id)
      );
    `);
    }
    findAllShipments() {
        return this.db.prepare('SELECT * FROM shipments ORDER BY created_at DESC').all();
    }
    createShipment(data) {
        const { manifest_id, product_type, volume, price, station_address, driver_address, planned_route } = data;
        const insertShipment = this.db.prepare(`
      INSERT INTO shipments (manifest_id, product_type, volume, price, station_address, driver_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        const insertCheckpoint = this.db.prepare(`
      INSERT INTO checkpoints (shipment_id, name, location, status, volume_recorded, variance)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
        const transaction = this.db.transaction(() => {
            const info = insertShipment.run(manifest_id, product_type, volume, price, station_address, driver_address);
            if (planned_route && Array.isArray(planned_route)) {
                planned_route.forEach((stopName) => {
                    insertCheckpoint.run(manifest_id, stopName, stopName, 'PENDING', 0, 0);
                });
            }
            return info;
        });
        const info = transaction();
        return { id: info.lastInsertRowid, ...data };
    }
    updateShipmentStatus(manifestId, status) {
        const info = this.db.prepare(`
      UPDATE shipments SET status = ? WHERE manifest_id = ?
    `).run(status, manifestId);
        return { success: true, updated: info.changes };
    }
    findCheckpoints(shipmentId) {
        return this.db.prepare('SELECT * FROM checkpoints WHERE shipment_id = ? ORDER BY timestamp ASC').all(shipmentId);
    }
    upsertCheckpoint(data) {
        const { shipment_id, name, location, status, volume_recorded, variance } = data;
        const existing = this.db.prepare("SELECT id FROM checkpoints WHERE shipment_id = ? AND name = ? AND status = 'PENDING'").get(shipment_id, name);
        if (existing) {
            this.db.prepare(`
        UPDATE checkpoints 
        SET location = ?, status = ?, volume_recorded = ?, variance = ?, timestamp = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(location, status, volume_recorded, variance, existing.id);
            return { id: existing.id, ...data, updated: true };
        }
        else {
            const info = this.db.prepare(`
        INSERT INTO checkpoints (shipment_id, name, location, status, volume_recorded, variance)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(shipment_id, name, location, status, volume_recorded, variance);
            return { id: info.lastInsertRowid, ...data, updated: false };
        }
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map