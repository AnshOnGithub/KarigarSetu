import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from './config.ts';

fs.mkdirSync(path.dirname(config.databaseFile), { recursive: true });
fs.mkdirSync(config.mediaDir, { recursive: true });

// Built-in SQLite (Node 22.5+): no native build step, works on any server with Node.
// Swap this module for Postgres when running multiple API instances.
interface Statement {
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  run(...params: unknown[]): { changes: number | bigint };
}

// Rows are cast to the table interfaces at each call site.
export const db = new DatabaseSync(config.databaseFile) as unknown as { exec(sql: string): void; prepare(sql: string): Statement };
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

/** Runs `fn` inside a transaction, rolling back if it throws. */
export function transaction<T>(fn: () => T): T {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

db.exec(`
CREATE TABLE IF NOT EXISTS artisans (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  craft TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'english',
  phone TEXT,
  state TEXT,
  district TEXT,
  pincode TEXT,
  udyam_number TEXT,
  scheme TEXT,
  beneficiary_id TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  artisan_id TEXT NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  client_id TEXT,
  title TEXT NOT NULL,
  title_hi TEXT,
  description TEXT NOT NULL,
  description_hi TEXT,
  local_description TEXT,
  highlights TEXT NOT NULL DEFAULT '[]',
  category TEXT NOT NULL DEFAULT '',
  hsn_code TEXT,
  materials TEXT,
  price INTEGER NOT NULL,
  mrp INTEGER,
  stock INTEGER NOT NULL DEFAULT 1,
  images TEXT NOT NULL DEFAULT '[]',
  channels TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'unpublished')),
  cost_breakdown TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (artisan_id, client_id)
);
CREATE INDEX IF NOT EXISTS products_updated ON products(updated_at);

CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT NOT NULL,
  secret TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id TEXT PRIMARY KEY,
  webhook_id TEXT NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  last_error TEXT,
  created_at TEXT NOT NULL,
  delivered_at TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL REFERENCES partners(id),
  external_order_id TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id),
  artisan_id TEXT NOT NULL REFERENCES artisans(id),
  channel TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  total INTEGER NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_city TEXT,
  buyer_type TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (partner_id, external_order_id)
);
`);

export const now = () => new Date().toISOString();
