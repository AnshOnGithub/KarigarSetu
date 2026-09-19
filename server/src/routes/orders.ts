import { Router } from 'express';
import { z } from 'zod';
import { requireArtisan, requirePartner } from '../auth.ts';
import { db, now, transaction } from '../db.ts';
import { newId } from '../lib/ids.ts';
import { HttpError, notFound } from '../lib/http.ts';
import type { ProductRow } from '../products.ts';
import { emit } from '../webhooks.ts';

const STATUSES = ['new', 'accepted', 'packed', 'shipped', 'delivered', 'cancelled'] as const;
const NEXT: Record<string, string | null> = { new: 'accepted', accepted: 'packed', packed: 'shipped', shipped: 'delivered', delivered: null, cancelled: null };

interface OrderRow {
  id: string;
  partner_id: string;
  external_order_id: string;
  product_id: string;
  artisan_id: string;
  channel: string;
  qty: number;
  unit_price: number;
  total: number;
  buyer_name: string;
  buyer_city: string | null;
  buyer_type: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const toOrder = (o: OrderRow) => ({
  id: o.id,
  externalOrderId: o.external_order_id,
  productId: o.product_id,
  channel: o.channel,
  qty: o.qty,
  unitPrice: o.unit_price,
  total: o.total,
  buyer: { name: o.buyer_name, city: o.buyer_city, type: o.buyer_type },
  status: o.status,
  createdAt: o.created_at,
  updatedAt: o.updated_at,
});

/** Partners push orders placed on their platform so the artisan sees them in the app. */
export const partnerOrders = Router();
partnerOrders.use(requirePartner);

const OrderInput = z.object({
  externalOrderId: z.string().min(1).max(80),
  productId: z.string(),
  qty: z.number().int().positive(),
  unitPrice: z.number().int().positive().optional(),
  buyer: z.object({ name: z.string().min(1).max(120), city: z.string().max(80).optional(), type: z.enum(['consumer', 'government', 'business']).optional() }),
});

partnerOrders.post('/', (req, res) => {
  const input = OrderInput.parse(req.body);
  const partner = req.partner!;
  const duplicate = db.prepare('SELECT * FROM orders WHERE partner_id = ? AND external_order_id = ?').get(partner.id, input.externalOrderId) as OrderRow | undefined;
  if (duplicate) {
    res.status(200).json({ data: toOrder(duplicate) });
    return;
  }

  const product = db.prepare("SELECT * FROM products WHERE id = ? AND status = 'published'").get(input.productId) as ProductRow | undefined;
  if (!product) throw notFound('Product');
  if (product.stock < input.qty) throw new HttpError(409, 'out_of_stock', `Only ${product.stock} in stock`);

  const id = newId('ord');
  const unitPrice = input.unitPrice ?? product.price;
  const timestamp = now();
  transaction(() => {
    db.prepare(
      `INSERT INTO orders (id, partner_id, external_order_id, product_id, artisan_id, channel, qty, unit_price, total, buyer_name, buyer_city, buyer_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, partner.id, input.externalOrderId, product.id, product.artisan_id, partner.channel === '*' ? 'B2B' : partner.channel, input.qty, unitPrice, unitPrice * input.qty, input.buyer.name, input.buyer.city ?? null, input.buyer.type ?? null, timestamp, timestamp);
    db.prepare('UPDATE products SET stock = stock - ?, updated_at = ? WHERE id = ?').run(input.qty, timestamp, product.id);
  });

  res.status(201).json({ data: toOrder(db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as OrderRow) });
});

partnerOrders.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE partner_id = ? AND (id = ? OR external_order_id = ?)').get(req.partner!.id, req.params.id, req.params.id) as OrderRow | undefined;
  if (!order) throw notFound('Order');
  res.json({ data: toOrder(order) });
});

/** Artisan app: list orders and move them forward (accept → pack → ship → deliver). */
export const artisanOrders = Router();
artisanOrders.use(requireArtisan);

artisanOrders.get('/', (req, res) => {
  const rows = db.prepare('SELECT o.*, p.title AS product_title, p.images AS product_images FROM orders o JOIN products p ON p.id = o.product_id WHERE o.artisan_id = ? ORDER BY o.created_at DESC').all(req.artisan!.id) as (OrderRow & { product_title: string; product_images: string })[];
  res.json({ data: rows.map((row) => ({ ...toOrder(row), productTitle: row.product_title })) });
});

artisanOrders.patch('/:id', (req, res) => {
  const { status } = z.object({ status: z.enum(STATUSES) }).parse(req.body);
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND artisan_id = ?').get(req.params.id, req.artisan!.id) as OrderRow | undefined;
  if (!order) throw notFound('Order');
  if (status !== 'cancelled' && NEXT[order.status] !== status) throw new HttpError(409, 'invalid_transition', `Cannot move order from ${order.status} to ${status}`);
  db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(status, now(), order.id);
  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id) as OrderRow;
  emit('order.status_changed', toOrder(updated), { partnerId: order.partner_id });
  res.json({ data: toOrder(updated) });
});
