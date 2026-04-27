import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import Database from 'better-sqlite3';
import axios from 'axios';

const app = new Hono();
const port = Number(process.env.PORT) || 3000;
const API_KEY = process.env.BACKEND_API_KEY;
const DB_PATH = process.env.DATABASE_URL || 'fuel_tracker.db';

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

// Middleware
app.use('*', logger());
app.use('*', cors());

// API Key Middleware
app.use('/api/*', async (c, next) => {
  if (!API_KEY) {
    console.warn("⚠️ BACKEND_API_KEY not set in .env. API is currently unprotected.");
    return await next();
  }

  const incomingKey = c.req.header('x-api-key') || c.req.header('authorization');
  if (incomingKey === API_KEY) {
    return await next();
  }

  return c.json({ error: 'Unauthorized: Invalid or missing API Key' }, 401);
});

// Routes
app.get('/api/shipments', (c) => {
  const shipments = db.prepare('SELECT * FROM shipments ORDER BY created_at DESC').all();
  return c.json(shipments);
});

app.post('/api/shipments', async (c) => {
  const body = await c.req.json();
  const { manifest_id, product_type, volume, price, station_address, driver_address, planned_route } = body;
  
  try {
    const insertShipment = db.prepare(`
      INSERT INTO shipments (manifest_id, product_type, volume, price, station_address, driver_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertCheckpoint = db.prepare(`
      INSERT INTO checkpoints (shipment_id, name, location, status, volume_recorded, variance)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      const info = insertShipment.run(manifest_id, product_type, volume, price, station_address, driver_address);
      
      if (planned_route && Array.isArray(planned_route)) {
        planned_route.forEach((stopName: string) => {
          insertCheckpoint.run(manifest_id, stopName, stopName, 'PENDING', 0, 0);
        });
      }
      return info;
    });

    const info = transaction();
    return c.json({ id: info.lastInsertRowid, ...body });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.patch('/api/shipments/:manifestId', async (c) => {
  const manifestId = c.req.param('manifestId');
  const { status } = await c.req.json();
  
  try {
    const info = db.prepare(`
      UPDATE shipments SET status = ? WHERE manifest_id = ?
    `).run(status, manifestId);
    return c.json({ success: true, updated: info.changes });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/api/checkpoints', (c) => {
  const shipmentId = c.req.query('shipmentId');
  if (!shipmentId) return c.json({ error: 'shipmentId is required' }, 400);
  
  const checkpoints = db.prepare('SELECT * FROM checkpoints WHERE shipment_id = ? ORDER BY timestamp ASC').all(shipmentId);
  return c.json(checkpoints);
});

app.post('/api/checkpoints', async (c) => {
  const body = await c.req.json();
  const { shipment_id, name, location, status, volume_recorded, variance } = body;
  
  try {
    const existing = db.prepare("SELECT id FROM checkpoints WHERE shipment_id = ? AND name = ? AND status = 'PENDING'").get(shipment_id, name) as { id: number } | undefined;

    if (existing) {
      db.prepare(`
        UPDATE checkpoints 
        SET location = ?, status = ?, volume_recorded = ?, variance = ?, timestamp = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(location, status, volume_recorded, variance, existing.id);
      return c.json({ id: existing.id, ...body, updated: true });
    } else {
      const info = db.prepare(`
        INSERT INTO checkpoints (shipment_id, name, location, status, volume_recorded, variance)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(shipment_id, name, location, status, volume_recorded, variance);
      return c.json({ id: info.lastInsertRowid, ...body, updated: false });
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Root route
app.get('/', (c) => c.text('Fuel Distribution API v2.4 (Hono) - Status: ONLINE'));

console.log(`🚀 Hono Backend starting on port ${port}`);

serve({
  fetch: app.fetch,
  port
});

// Keep-Alive Heartbeat (Render Free Tier)
const SELF_URL = process.env.SELF_URL;
if (SELF_URL) {
  console.log(`💓 Heartbeat: ACTIVE (Pinging ${SELF_URL}/health every 10 min)`);
  setInterval(async () => {
    try {
      await axios.get(`${SELF_URL}/health`);
      console.log("💓 Heartbeat: Server kept warm.");
    } catch (e) {
      console.warn("💔 Heartbeat: Ping failed.");
    }
  }, 10 * 60 * 1000); // 10 minutes (Render timeout is 15min)
}
