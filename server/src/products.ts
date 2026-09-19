import { config } from './config.ts';
import { db } from './db.ts';
import type { ArtisanRow } from './auth.ts';

export const CHANNELS = ['ONDC', 'GeM', 'B2B', 'INDIA_HANDMADE'] as const;
export type Channel = (typeof CHANNELS)[number];

export interface ProductRow {
  id: string;
  artisan_id: string;
  client_id: string | null;
  title: string;
  title_hi: string | null;
  description: string;
  description_hi: string | null;
  local_description: string | null;
  highlights: string;
  category: string;
  hsn_code: string | null;
  materials: string | null;
  price: number;
  mrp: number | null;
  stock: number;
  images: string;
  channels: string;
  status: 'draft' | 'published' | 'unpublished';
  cost_breakdown: string | null;
  created_at: string;
  updated_at: string;
}

const mediaUrl = (file: string) => (/^https?:\/\//.test(file) ? file : `${config.publicUrl}/media/${file}`);

/** Stable, platform-neutral catalogue item. Every export format is derived from this. */
export function toCatalogItem(product: ProductRow, artisan: ArtisanRow) {
  return {
    id: product.id,
    sku: `KS-${product.id.slice(4, 12).toUpperCase()}`,
    status: product.status,
    title: { en: product.title, hi: product.title_hi },
    description: {
      en: product.description,
      hi: product.description_hi,
      local: product.local_description ? { language: artisan.language, text: product.local_description } : null,
    },
    highlights: JSON.parse(product.highlights) as string[],
    category: product.category,
    hsnCode: product.hsn_code,
    materials: product.materials,
    price: { currency: 'INR', value: product.price, mrp: product.mrp ?? product.price },
    stock: product.stock,
    images: (JSON.parse(product.images) as string[]).map(mediaUrl),
    channels: JSON.parse(product.channels) as Channel[],
    attributes: { handmade: true, countryOfOrigin: 'IND' },
    artisan: {
      id: artisan.id,
      name: artisan.name,
      craft: artisan.craft,
      state: artisan.state,
      district: artisan.district,
      pincode: artisan.pincode,
      udyamNumber: artisan.udyam_number,
      scheme: artisan.scheme,
    },
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

export type CatalogItem = ReturnType<typeof toCatalogItem>;

export function loadItem(productId: string): CatalogItem | null {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as ProductRow | undefined;
  if (!product) return null;
  const artisan = db.prepare('SELECT * FROM artisans WHERE id = ?').get(product.artisan_id) as ArtisanRow;
  return toCatalogItem(product, artisan);
}
