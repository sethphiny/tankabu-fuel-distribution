import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;
const API_KEY = process.env.BACKEND_API_KEY;
const DB_PATH = process.env.DATABASE_URL || 'fuel_tracker.db';

app.use(cors());
app.use(express.json());

// Middleware: API Key Validation
const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const incomingKey = req.headers['x-api-key'] || req.headers['authorization'];
  
  if (!API_KEY) {
    console.warn("⚠️ BACKEND_API_KEY not set in .env. API is currently unprotected.");
    return next();
  }

  if (incomingKey === API_KEY) {
    return next();
  }

  res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
};

// Database setup
const db = new Database(DB_PATH);

db.exec(`
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

// API Routes (Protected by validateApiKey)
app.get('/api/shipments', validateApiKey, (req, res) => {
  const shipments = db.prepare('SELECT * FROM shipments ORDER BY created_at DESC').all();
  res.json(shipments);
});

app.post('/api/shipments', validateApiKey, (req, res) => {
  const { manifest_id, product_type, volume, price, station_address, driver_address, planned_route } = req.body;
  try {
    const insertShipment = db.prepare(`
      INSERT INTO shipments (manifest_id, product_type, volume, price, station_address, driver_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertCheckpoint = db.prepare(`
      INSERT INTO checkpoints (shipment_id, name, location, status, volume_recorded, variance)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Use a transaction for atomic insert
    const transaction = db.transaction(() => {
      const info = insertShipment.run(manifest_id, product_type, volume, price, station_address, driver_address);
      
      // If a planned route exists, initialize those checkpoints
      if (planned_route && Array.isArray(planned_route)) {
        planned_route.forEach((stopName: string) => {
          insertCheckpoint.run(manifest_id, stopName, stopName, 'PENDING', 0, 0);
        });
      }
      return info;
    });

    const info = transaction();
    res.json({ id: info.lastInsertRowid, ...req.body });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.patch('/api/shipments/:manifestId', validateApiKey, (req, res) => {
  const { manifestId } = req.params;
  const { status } = req.body;
  try {
    const info = db.prepare(`
      UPDATE shipments SET status = ? WHERE manifest_id = ?
    `).run(status, manifestId);
    res.json({ success: true, updated: info.changes });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/checkpoints', validateApiKey, (req, res) => {
  const { shipmentId } = req.query;
  if (!shipmentId) return res.status(400).json({ error: 'shipmentId is required' });
  const checkpoints = db.prepare('SELECT * FROM checkpoints WHERE shipment_id = ? ORDER BY timestamp ASC').all(shipmentId);
  res.json(checkpoints);
});

app.post('/api/checkpoints', validateApiKey, (req, res) => {
  const { shipment_id, name, location, status, volume_recorded, variance } = req.body;
  try {
    // Check if a PENDING checkpoint already exists for this milestone
    const existing = db.prepare("SELECT id FROM checkpoints WHERE shipment_id = ? AND name = ? AND status = 'PENDING'").get(shipment_id, name) as { id: number } | undefined;

    if (existing) {
      // Update the planned milestone
      db.prepare(`
        UPDATE checkpoints 
        SET location = ?, status = ?, volume_recorded = ?, variance = ?, timestamp = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(location, status, volume_recorded, variance, existing.id);
      res.json({ id: existing.id, ...req.body, updated: true });
    } else {
      // Insert as a new ad-hoc checkpoint
      const info = db.prepare(`
        INSERT INTO checkpoints (shipment_id, name, location, status, volume_recorded, variance)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(shipment_id, name, location, status, volume_recorded, variance);
      res.json({ id: info.lastInsertRowid, ...req.body, updated: false });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Standalone Fuel Tracker Backend running at http://localhost:${port}`);
  console.log(`🔒 API Protection: ACTIVE (Header: x-api-key)`);
  
  // Keep-Alive Heartbeat (Render Free Tier)
  const SELF_URL = process.env.SELF_URL;
  if (SELF_URL) {
    console.log(`💓 Heartbeat: ACTIVE (Pinging ${SELF_URL} every 40s)`);
    setInterval(async () => {
      try {
        const { data } = await axios.get(`${SELF_URL}/api/shipments`, {
          headers: { 'x-api-key': API_KEY || '' }
        });
        console.log("💓 Heartbeat: Stayin' alive...");
      } catch (e) {
        console.warn("💔 Heartbeat: Ping failed, but I'm still tryin'...");
      }
    }, 40 * 1000); // 40 seconds
  } else {
    console.warn("💓 Heartbeat: DISABLED (Set SELF_URL in .env to prevent spin-down)");
  }
});
