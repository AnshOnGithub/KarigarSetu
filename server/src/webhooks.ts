import crypto from 'node:crypto';
import { db, now } from './db.ts';
import { newId } from './lib/ids.ts';
import type { Channel } from './products.ts';

export const EVENTS = ['product.published', 'product.updated', 'product.unpublished', 'order.status_changed'] as const;
export type WebhookEvent = (typeof EVENTS)[number];

interface WebhookRow {
  id: string;
  partner_id: string;
  url: string;
  events: string;
  secret: string;
  channel: string;
}

const RETRY_DELAYS_MS = [0, 30_000, 5 * 60_000, 30 * 60_000];

/** `t=<unix>,v1=<hex HMAC-SHA256 of "<t>.<body>">` — partners verify with their webhook secret. */
export function sign(secret: string, body: string, timestamp = Math.floor(Date.now() / 1000)) {
  const v1 = crypto.createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
  return `t=${timestamp},v1=${v1}`;
}

/**
 * Queues an event for every partner subscribed to it. Product events only go to
 * partners whose channel the artisan chose (a partner with channel "*" gets all).
 */
export function emit(event: WebhookEvent, data: unknown, target: { channels?: Channel[]; partnerId?: string }) {
  const hooks = db
    .prepare('SELECT w.*, p.channel FROM webhooks w JOIN partners p ON p.id = w.partner_id WHERE w.active = 1')
    .all() as WebhookRow[];

  for (const hook of hooks) {
    if (!(JSON.parse(hook.events) as string[]).includes(event)) continue;
    if (target.partnerId && hook.partner_id !== target.partnerId) continue;
    if (target.channels && hook.channel !== '*' && !target.channels.includes(hook.channel as Channel)) continue;

    const id = newId('evt');
    const payload = JSON.stringify({ id, type: event, createdAt: now(), data });
    db.prepare('INSERT INTO webhook_deliveries (id, webhook_id, event, payload, created_at) VALUES (?, ?, ?, ?, ?)').run(id, hook.id, event, payload, now());
    void deliver(id);
  }
}

async function deliver(deliveryId: string) {
  const row = db
    .prepare('SELECT d.*, w.url, w.secret FROM webhook_deliveries d JOIN webhooks w ON w.id = d.webhook_id WHERE d.id = ?')
    .get(deliveryId) as { id: string; payload: string; attempts: number; url: string; secret: string; event: string } | undefined;
  if (!row) return;

  const attempt = row.attempts + 1;
  try {
    const response = await fetch(row.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KarigarSetu-Webhooks/1.0',
        'X-KarigarSetu-Event': row.event,
        'X-KarigarSetu-Delivery': row.id,
        'X-KarigarSetu-Signature': sign(row.secret, row.payload),
      },
      body: row.payload,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    db.prepare("UPDATE webhook_deliveries SET attempts = ?, status = 'delivered', delivered_at = ?, last_error = NULL WHERE id = ?").run(attempt, now(), row.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const giveUp = attempt >= RETRY_DELAYS_MS.length;
    db.prepare('UPDATE webhook_deliveries SET attempts = ?, status = ?, last_error = ? WHERE id = ?').run(attempt, giveUp ? 'failed' : 'pending', message, row.id);
    if (!giveUp) setTimeout(() => void deliver(row.id), RETRY_DELAYS_MS[attempt]).unref();
  }
}

/** Resume retries that were pending when the server stopped. */
export function resumePendingDeliveries() {
  const pending = db.prepare("SELECT id FROM webhook_deliveries WHERE status = 'pending'").all() as { id: string }[];
  pending.forEach(({ id }) => void deliver(id));
}
