import type { NextFunction, Request, Response } from 'express';
import crypto from 'node:crypto';
import { db } from './db.ts';
import { config } from './config.ts';
import { hashSecret } from './lib/ids.ts';
import { HttpError } from './lib/http.ts';

export interface ArtisanRow {
  id: string;
  name: string;
  craft: string;
  language: string;
  phone: string | null;
  state: string | null;
  district: string | null;
  pincode: string | null;
  udyam_number: string | null;
  scheme: string | null;
  beneficiary_id: string | null;
  created_at: string;
}

export interface PartnerRow {
  id: string;
  name: string;
  channel: string;
  created_at: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    artisan?: ArtisanRow;
    partner?: PartnerRow;
  }
}

const bearer = (req: Request) => req.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

/** Artisan app: `Authorization: Bearer ks_art_…` issued at registration. */
export function requireArtisan(req: Request, _res: Response, next: NextFunction) {
  const token = bearer(req);
  const artisan = token ? (db.prepare('SELECT * FROM artisans WHERE token_hash = ?').get(hashSecret(token)) as ArtisanRow | undefined) : undefined;
  if (!artisan) return next(new HttpError(401, 'unauthorized', 'Missing or invalid artisan token'));
  req.artisan = artisan;
  next();
}

/** Government / marketplace partners: `X-API-Key: ks_live_…`. */
export function requirePartner(req: Request, _res: Response, next: NextFunction) {
  const key = req.header('x-api-key') ?? bearer(req);
  const partner = key ? (db.prepare('SELECT id, name, channel, created_at FROM partners WHERE key_hash = ?').get(hashSecret(key)) as PartnerRow | undefined) : undefined;
  if (!partner) return next(new HttpError(401, 'unauthorized', 'Missing or invalid X-API-Key'));
  req.partner = partner;
  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const key = req.header('x-admin-key') ?? '';
  const expected = config.adminApiKey;
  const ok = expected.length > 0 && key.length === expected.length && crypto.timingSafeEqual(Buffer.from(key), Buffer.from(expected));
  if (!ok) return next(new HttpError(401, 'unauthorized', 'Invalid admin key'));
  next();
}
