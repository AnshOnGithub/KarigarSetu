import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requirePartner } from '../auth.ts';
import { db, now } from '../db.ts';
import { hashSecret, newId, newSecret } from '../lib/ids.ts';
import { HttpError, notFound } from '../lib/http.ts';
import { CHANNELS } from '../products.ts';
import { EVENTS } from '../webhooks.ts';

/** Admin (e.g. MoSJE / NSFDC operator) issues API keys to integrating platforms. */
export const partners = Router();

partners.post('/', requireAdmin, (req, res) => {
  const input = z.object({ name: z.string().min(1).max(120), channel: z.enum([...CHANNELS, '*']) }).parse(req.body);
  const id = newId('ptn');
  const apiKey = newSecret('ks_live');
  db.prepare('INSERT INTO partners (id, name, channel, key_hash, created_at) VALUES (?, ?, ?, ?, ?)').run(id, input.name, input.channel, hashSecret(apiKey), now());
  res.status(201).json({ data: { id, name: input.name, channel: input.channel }, apiKey });
});

export const webhooks = Router();
webhooks.use(requirePartner);

const isPublicHttps = (url: string) => {
  const { protocol, hostname } = new URL(url);
  if (process.env.NODE_ENV !== 'production') return protocol === 'https:' || protocol === 'http:';
  return protocol === 'https:' && !/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/.test(hostname);
};

webhooks.post('/', (req, res) => {
  const input = z.object({ url: z.string().url(), events: z.array(z.enum(EVENTS)).min(1) }).parse(req.body);
  if (!isPublicHttps(input.url)) throw new HttpError(422, 'invalid_url', 'Webhook URL must be a public https URL');
  const id = newId('whk');
  const secret = newSecret('whsec');
  db.prepare('INSERT INTO webhooks (id, partner_id, url, events, secret, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, req.partner!.id, input.url, JSON.stringify(input.events), secret, now());
  res.status(201).json({ data: { id, url: input.url, events: input.events }, secret });
});

webhooks.get('/', (req, res) => {
  const rows = db.prepare('SELECT id, url, events, active, created_at FROM webhooks WHERE partner_id = ?').all(req.partner!.id) as { id: string; url: string; events: string; active: number; created_at: string }[];
  res.json({ data: rows.map((r) => ({ id: r.id, url: r.url, events: JSON.parse(r.events), active: Boolean(r.active), createdAt: r.created_at })) });
});

webhooks.get('/:id/deliveries', (req, res) => {
  const hook = db.prepare('SELECT id FROM webhooks WHERE id = ? AND partner_id = ?').get(req.params.id, req.partner!.id);
  if (!hook) throw notFound('Webhook');
  const rows = db.prepare('SELECT id, event, attempts, status, last_error, created_at, delivered_at FROM webhook_deliveries WHERE webhook_id = ? ORDER BY created_at DESC LIMIT 100').all(req.params.id);
  res.json({ data: rows });
});

webhooks.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM webhooks WHERE id = ? AND partner_id = ?').run(req.params.id, req.partner!.id);
  if (!result.changes) throw notFound('Webhook');
  res.status(204).end();
});
