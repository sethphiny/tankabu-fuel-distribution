import { Injectable, OnModuleInit } from '@nestjs/common';
import Database from 'better-sqlite3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ShipmentsService implements OnModuleInit {
  private db: Database.Database;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const dbPath = this.configService.get<string>('DATABASE_URL') || 'fuel_tracker.db';
    this.db = new Database(dbPath);
    this.initDb();
  }

  private initDb() {
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

  createShipment(data: any) {
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
        planned_route.forEach((stopName: string) => {
          insertCheckpoint.run(manifest_id, stopName, stopName, 'PENDING', 0, 0);
        });
      }
      return info;
    });

    const info = transaction();
    return { id: info.lastInsertRowid, ...data };
  }

  updateShipmentStatus(manifestId: string, status: string) {
    const info = this.db.prepare(`
      UPDATE shipments SET status = ? WHERE manifest_id = ?
    `).run(status, manifestId);
    return { success: true, updated: info.changes };
  }

  findCheckpoints(shipmentId: string) {
    return this.db.prepare('SELECT * FROM checkpoints WHERE shipment_id = ? ORDER BY timestamp ASC').all(shipmentId);
  }

  upsertCheckpoint(data: any) {
    const { shipment_id, name, location, status, volume_recorded, variance } = data;
    const existing = this.db.prepare("SELECT id FROM checkpoints WHERE shipment_id = ? AND name = ? AND status = 'PENDING'").get(shipment_id, name) as { id: number } | undefined;

    if (existing) {
      this.db.prepare(`
        UPDATE checkpoints 
        SET location = ?, status = ?, volume_recorded = ?, variance = ?, timestamp = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(location, status, volume_recorded, variance, existing.id);
      return { id: existing.id, ...data, updated: true };
    } else {
      const info = this.db.prepare(`
        INSERT INTO checkpoints (shipment_id, name, location, status, volume_recorded, variance)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(shipment_id, name, location, status, volume_recorded, variance);
      return { id: info.lastInsertRowid, ...data, updated: false };
    }
  }
}
