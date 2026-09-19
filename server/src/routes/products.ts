import { Router } from 'express';
import { z } from 'zod';
import { requireArtisan } from '../auth.ts';
import { db, now } from '../db.ts';
import { newId } from '../lib/ids.ts';
import { notFound } from '../lib/http.ts';
import { saveImage } from '../lib/media.ts';
import { CHANNELS, loadItem, toCatalogItem, type Channel, type ProductRow } from '../products.ts';
import { emit } from '../webhooks.ts';

/** Artisan-app endpoints: the app pushes listings here after the artisan taps Publish. */
export const products = Router();
products.use(requireArtisan);

const ImageInput = z.union([
  z.string().url(),
  z.object({ data: z.string().min(1), mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']) }),
]);

const ProductInput = z.object({
  /** The app's local id; re-sending the same clientId updates instead of duplicating (safe retries offline). */
  clientId: z.string().max(64).optional(),
  title: z.string().trim().min(1).max(200),
  titleHi: z.string().trim().max(200).optional(),
  description: z.string().trim().max(5000),
  descriptionHi: z.string().trim().max(5000).optional(),
  localDescription: z.string().trim().max(5000).optional(),
  highlights: z.array(z.string().max(200)).max(10).default([]),
  category: z.string().trim().max(80).default(''),
  hsnCode: z.string().regex(/^\d{4,8}$/).optional(),
  materials: z.string().trim().max(200).optional(),
  price: z.number().int().positive(),
  mrp: z.number().int().positive().optional(),
  stock: z.number().int().min(0).default(1),
  images: z.array(ImageInput).max(6).default([]),
  channels: z.array(z.enum(CHANNELS)).default(['ONDC']),
  status: z.enum(['draft', 'published', 'unpublished']).default('published'),
  costBreakdown: z.object({ material: z.number(), labour: z.number(), margin: z.number() }).optional(),
});

const storeImages = (images: z.infer<typeof ImageInput>[]) => images.map((img) => (typeof img === 'string' ? img : saveImage(img.data, img.mimeType)));

function ownProduct(artisanId: string, id: string) {
  const row = db.prepare('SELECT * FROM products WHERE id = ? AND artisan_id = ?').get(id, artisanId) as ProductRow | undefined;
  if (!row) throw notFound('Product');
  return row;
}

function announce(before: ProductRow | null, after: ProductRow) {
  const item = loadItem(after.id)!;
  const channels = JSON.parse(after.channels) as Channel[];
  if (after.status === 'published') {
    emit(before?.status === 'published' ? 'product.updated' : 'product.published', item, { channels });
  } else if (before?.status === 'published') {
    // Tell partners that were listing it, including channels the artisan just removed.
    const previous = JSON.parse(before.channels) as Channel[];
    emit('product.unpublished', item, { channels: [...new Set([...previous, ...channels])] });
  }
}

products.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM products WHERE artisan_id = ? ORDER BY updated_at DESC').all(req.artisan!.id) as ProductRow[];
  res.json({ data: rows.map((row) => toCatalogItem(row, req.artisan!)) });
});

products.post('/', (req, res) => {
  const input = ProductInput.parse(req.body);
  const artisanId = req.artisan!.id;
  const existing = input.clientId
    ? (db.prepare('SELECT * FROM products WHERE artisan_id = ? AND client_id = ?').get(artisanId, input.clientId) as ProductRow | undefined)
    : undefined;

  const id = existing?.id ?? newId('prd');
  const timestamp = now();
  const images = input.images.length ? JSON.stringify(storeImages(input.images)) : (existing?.images ?? '[]');
  const values = [
    input.title, input.titleHi ?? null, input.description, input.descriptionHi ?? null, input.localDescription ?? null,
    JSON.stringify(input.highlights), input.category, input.hsnCode ?? null, input.materials ?? null,
    input.price, input.mrp ?? null, input.stock, images, JSON.stringify(input.channels), input.status,
    input.costBreakdown ? JSON.stringify(input.costBreakdown) : null,
  ];

  if (existing) {
    db.prepare(
      `UPDATE products SET title = ?, title_hi = ?, description = ?, description_hi = ?, local_description = ?, highlights = ?, category = ?, hsn_code = ?, materials = ?,
       price = ?, mrp = ?, stock = ?, images = ?, channels = ?, status = ?, cost_breakdown = ?, updated_at = ? WHERE id = ?`
    ).run(...values, timestamp, id);
  } else {
    db.prepare(
      `INSERT INTO products (title, title_hi, description, description_hi, local_description, highlights, category, hsn_code, materials,
       price, mrp, stock, images, channels, status, cost_breakdown, id, artisan_id, client_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(...values, id, artisanId, input.clientId ?? null, timestamp, timestamp);
  }

  const saved = ownProduct(artisanId, id);
  announce(existing ?? null, saved);
  res.status(existing ? 200 : 201).json({ data: toCatalogItem(saved, req.artisan!) });
});

const ProductPatch = ProductInput.omit({ clientId: true }).partial();

products.patch('/:id', (req, res) => {
  const before = ownProduct(req.artisan!.id, req.params.id);
  const input = ProductPatch.parse(req.body);
  const set = (column: string, value: unknown) => ({ column, value });
  const updates = [
    input.title !== undefined && set('title', input.title),
    input.titleHi !== undefined && set('title_hi', input.titleHi),
    input.description !== undefined && set('description', input.description),
    input.descriptionHi !== undefined && set('description_hi', input.descriptionHi),
    input.localDescription !== undefined && set('local_description', input.localDescription),
    input.highlights !== undefined && set('highlights', JSON.stringify(input.highlights)),
    input.category !== undefined && set('category', input.category),
    input.hsnCode !== undefined && set('hsn_code', input.hsnCode),
    input.materials !== undefined && set('materials', input.materials),
    input.price !== undefined && set('price', input.price),
    input.mrp !== undefined && set('mrp', input.mrp),
    input.stock !== undefined && set('stock', input.stock),
    input.images !== undefined && input.images.length > 0 && set('images', JSON.stringify(storeImages(input.images))),
    input.channels !== undefined && set('channels', JSON.stringify(input.channels)),
    input.status !== undefined && set('status', input.status),
    input.costBreakdown !== undefined && set('cost_breakdown', JSON.stringify(input.costBreakdown)),
  ].filter((u): u is { column: string; value: unknown } => Boolean(u));

  if (updates.length) {
    db.prepare(`UPDATE products SET ${updates.map((u) => `${u.column} = ?`).join(', ')}, updated_at = ? WHERE id = ?`).run(...updates.map((u) => u.value), now(), before.id);
  }
  const after = ownProduct(req.artisan!.id, before.id);
  if (updates.length) announce(before, after);
  res.json({ data: toCatalogItem(after, req.artisan!) });
});

/** Soft delete: marks unpublished so partners are told to delist it. */
products.delete('/:id', (req, res) => {
  const before = ownProduct(req.artisan!.id, req.params.id);
  db.prepare("UPDATE products SET status = 'unpublished', updated_at = ? WHERE id = ?").run(now(), before.id);
  announce(before, ownProduct(req.artisan!.id, before.id));
  res.status(204).end();
});
