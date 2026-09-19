import { Router } from 'express';
import { z } from 'zod';
import { requireArtisan, type ArtisanRow } from '../auth.ts';
import { db, now } from '../db.ts';
import { hashSecret, newId, newSecret } from '../lib/ids.ts';

export const artisans = Router();

const ArtisanInput = z.object({
  name: z.string().trim().min(1).max(120),
  craft: z.string().trim().max(120).default(''),
  language: z.string().trim().max(20).default('english'),
  phone: z.string().trim().max(15).optional(),
  state: z.string().trim().max(60).optional(),
  district: z.string().trim().max(60).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  /** Udyam registration, needed by GeM and most B2B buyers. */
  udyamNumber: z.string().trim().max(30).optional(),
  /** Scheme the artisan is a beneficiary of, e.g. NSFDC, NBCFDC, NSKFDC, PM-DAKSH. */
  scheme: z.string().trim().max(40).optional(),
  beneficiaryId: z.string().trim().max(60).optional(),
});

export const publicArtisan = (a: ArtisanRow) => ({
  id: a.id,
  name: a.name,
  craft: a.craft,
  language: a.language,
  phone: a.phone,
  state: a.state,
  district: a.district,
  pincode: a.pincode,
  udyamNumber: a.udyam_number,
  scheme: a.scheme,
  beneficiaryId: a.beneficiary_id,
  createdAt: a.created_at,
});

/** Called once by the app. The token is only returned here; the app keeps it on the phone. */
artisans.post('/', (req, res) => {
  const input = ArtisanInput.parse(req.body);
  const id = newId('art');
  const token = newSecret('ks_art');
  db.prepare(
    `INSERT INTO artisans (id, token_hash, name, craft, language, phone, state, district, pincode, udyam_number, scheme, beneficiary_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, hashSecret(token), input.name, input.craft, input.language, input.phone ?? null, input.state ?? null, input.district ?? null, input.pincode ?? null, input.udyamNumber ?? null, input.scheme ?? null, input.beneficiaryId ?? null, now());
  const artisan = db.prepare('SELECT * FROM artisans WHERE id = ?').get(id) as ArtisanRow;
  res.status(201).json({ artisan: publicArtisan(artisan), token });
});

artisans.get('/me', requireArtisan, (req, res) => {
  res.json({ artisan: publicArtisan(req.artisan!) });
});

artisans.patch('/me', requireArtisan, (req, res) => {
  const input = ArtisanInput.partial().parse(req.body);
  const a = req.artisan!;
  db.prepare(
    `UPDATE artisans SET name = ?, craft = ?, language = ?, phone = ?, state = ?, district = ?, pincode = ?, udyam_number = ?, scheme = ?, beneficiary_id = ? WHERE id = ?`
  ).run(
    input.name ?? a.name,
    input.craft ?? a.craft,
    input.language ?? a.language,
    input.phone ?? a.phone,
    input.state ?? a.state,
    input.district ?? a.district,
    input.pincode ?? a.pincode,
    input.udyamNumber ?? a.udyam_number,
    input.scheme ?? a.scheme,
    input.beneficiaryId ?? a.beneficiary_id,
    a.id
  );
  res.json({ artisan: publicArtisan(db.prepare('SELECT * FROM artisans WHERE id = ?').get(a.id) as ArtisanRow) });
});
