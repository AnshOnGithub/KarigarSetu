import { Router } from 'express';
import { z } from 'zod';
import { requirePartner, type ArtisanRow } from '../auth.ts';
import { db } from '../db.ts';
import { notFound } from '../lib/http.ts';
import { CHANNELS, toCatalogItem, type ProductRow } from '../products.ts';
import { toCsv, toOndcCatalog } from '../formats.ts';

/** Partner (government / marketplace) pull API. */
export const catalog = Router();
catalog.use(requirePartner);

const Query = z.object({
  channel: z.enum(CHANNELS).optional(),
  category: z.string().optional(),
  state: z.string().optional(),
  q: z.string().optional(),
  /** ISO timestamp: only items changed after this, for incremental sync. Includes unpublished items so partners can delist. */
  updatedSince: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  /** Opaque cursor from the previous page's `nextCursor`. */
  cursor: z.string().optional(),
});

function query(raw: unknown, partnerChannel: string) {
  const params = Query.parse(raw);
  // A partner registered for one channel only sees products the artisan chose to list there.
  const channel = partnerChannel === '*' ? params.channel : partnerChannel;
  const where: string[] = [];
  const args: unknown[] = [];

  if (params.updatedSince) {
    where.push("p.updated_at > ? AND p.status IN ('published', 'unpublished')");
    args.push(params.updatedSince);
  } else {
    where.push("p.status = 'published'");
  }
  if (channel) {
    where.push('EXISTS (SELECT 1 FROM json_each(p.channels) WHERE value = ?)');
    args.push(channel);
  }
  if (params.category) {
    where.push('p.category LIKE ?');
    args.push(`%${params.category}%`);
  }
  if (params.state) {
    where.push('a.state = ?');
    args.push(params.state);
  }
  if (params.q) {
    where.push('(p.title LIKE ? OR p.description LIKE ? OR a.craft LIKE ?)');
    args.push(`%${params.q}%`, `%${params.q}%`, `%${params.q}%`);
  }
  if (params.cursor) {
    const [updatedAt, id] = Buffer.from(params.cursor, 'base64url').toString().split('|');
    where.push('(p.updated_at > ? OR (p.updated_at = ? AND p.id > ?))');
    args.push(updatedAt, updatedAt, id);
  }

  const rows = db
    .prepare(
      `SELECT p.*, a.id AS a_id FROM products p JOIN artisans a ON a.id = p.artisan_id
       WHERE ${where.join(' AND ')} ORDER BY p.updated_at, p.id LIMIT ?`
    )
    .all(...args, params.limit + 1) as (ProductRow & { a_id: string })[];

  const page = rows.slice(0, params.limit);
  const artisanStmt = db.prepare('SELECT * FROM artisans WHERE id = ?');
  const items = page.map((row) => toCatalogItem(row, artisanStmt.get(row.a_id) as ArtisanRow));
  const last = page.at(-1);
  const nextCursor = rows.length > params.limit && last ? Buffer.from(`${last.updated_at}|${last.id}`).toString('base64url') : null;
  return { items, nextCursor };
}

catalog.get('/', (req, res) => {
  const { items, nextCursor } = query(req.query, req.partner!.channel);
  res.json({ data: items, nextCursor });
});

catalog.get('/ondc', (req, res) => {
  const { items, nextCursor } = query(req.query, req.partner!.channel);
  res.json({ catalog: toOndcCatalog(items), nextCursor });
});

catalog.get('/export.csv', (req, res) => {
  const { items, nextCursor } = query({ limit: 500, ...req.query }, req.partner!.channel);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="karigarsetu-catalog.csv"');
  if (nextCursor) res.setHeader('X-Next-Cursor', nextCursor);
  // BOM so Excel opens Hindi text correctly.
  res.send(`﻿${toCsv(items)}`);
});

catalog.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as ProductRow | undefined;
  const channel = req.partner!.channel;
  if (!row || row.status === 'draft' || (channel !== '*' && !(JSON.parse(row.channels) as string[]).includes(channel))) throw notFound('Product');
  res.json({ data: toCatalogItem(row, db.prepare('SELECT * FROM artisans WHERE id = ?').get(row.artisan_id) as ArtisanRow) });
});
