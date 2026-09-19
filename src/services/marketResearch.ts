import { config } from '@/config';
import { getLanguageInfo } from '@/i18n/languages';
import type { Language } from '@/types';
import { createInteraction, outputText } from './gemini';
import { photoToBase64OrNull } from './image';

/**
 * Three-step pricing assistant. Each step is a separate model call so the artisan
 * sees the reasoning appear one stage at a time instead of a single opaque wait:
 *   1. look at the photo          → what the product is, material, size, finish
 *   2. compare the market         → what similar handmade items sell for in India
 *   3. decide the price           → a range plus one recommended price, explained
 */

export interface ProductAnalysis {
  product: string;
  craft: string;
  material: string;
  size: string;
  finish: string;
}

export interface Comparable {
  description: string;
  channel: string;
  price: number;
}

export interface MarketScan {
  comparables: Comparable[];
  low: number;
  high: number;
  demandNote: string;
}

export interface PriceVerdict {
  recommended: number;
  low: number;
  high: number;
  reason: string;
  reasonLocal: string;
}

export interface MarketResearch {
  analysis: ProductAnalysis;
  market: MarketScan;
  verdict: PriceVerdict;
}

export type ResearchStage = 'analysis' | 'market' | 'verdict';

export interface ResearchInput {
  photoUri: string | null;
  title: string;
  description: string;
  transcript: string;
  language: Language;
  craft: string;
  /** Material + labour the artisan entered, when they have filled it in. */
  costFloor: number;
}

const SYSTEM =
  'You are a pricing analyst for Indian handmade products sold on ONDC, GeM, Amazon Karigar and B2B gifting channels. ' +
  'You know current Indian retail price bands for handicrafts by craft, material and size. ' +
  'Use only what the photo and the artisan describe; never invent certifications or materials. Prices are in INR.';

const ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['product', 'craft', 'material', 'size', 'finish'],
  properties: {
    product: { type: 'string', description: 'What the product is, 2-5 words.' },
    craft: { type: 'string', description: 'Craft or technique, e.g. Dhokra casting, mosaic glass work, Pattachitra painting.' },
    material: { type: 'string', description: 'Main materials visible or described.' },
    size: { type: 'string', description: 'Approximate size or capacity, from the photo or the artisan.' },
    finish: { type: 'string', description: 'Workmanship and finish quality in one short phrase.' },
  },
} as const;

const MARKET_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['comparables', 'typical_low_inr', 'typical_high_inr', 'demand_note'],
  properties: {
    comparables: {
      type: 'array',
      description: 'Three comparable handmade products currently sold in India.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['description', 'channel', 'price_inr'],
        properties: {
          description: { type: 'string', description: 'Comparable product, 3-7 words.' },
          channel: { type: 'string', description: 'Where it sells, e.g. ONDC, GeM, Amazon Karigar, craft fair, B2B gifting.' },
          price_inr: { type: 'integer' },
        },
      },
    },
    typical_low_inr: { type: 'integer', description: 'Lower end of the retail band for this kind of product.' },
    typical_high_inr: { type: 'integer', description: 'Upper end of the retail band.' },
    demand_note: { type: 'string', description: 'One sentence on demand, season or buyer type in English.' },
  },
} as const;

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['recommended_price_inr', 'range_low_inr', 'range_high_inr', 'reason_en', 'reason_local'],
  properties: {
    recommended_price_inr: { type: 'integer', description: 'One competitive price the artisan should list at.' },
    range_low_inr: { type: 'integer', description: 'Lowest sensible listing price.' },
    range_high_inr: { type: 'integer', description: 'Highest sensible listing price.' },
    reason_en: { type: 'string', description: 'One sentence in English explaining the recommendation.' },
    reason_local: { type: 'string', description: 'The same sentence in the artisan language named in the message, in its own script.' },
  },
} as const;

interface RawMarket {
  comparables: { description: string; channel: string; price_inr: number }[];
  typical_low_inr: number;
  typical_high_inr: number;
  demand_note: string;
}

interface RawVerdict {
  recommended_price_inr: number;
  range_low_inr: number;
  range_high_inr: number;
  reason_en: string;
  reason_local: string;
}

async function ask<T>(input: Parameters<typeof createInteraction>[0]['input'], schema: object): Promise<T> {
  const response = await createInteraction(
    {
      model: config.geminiTextModel,
      system_instruction: SYSTEM,
      input,
      generation_config: { thinking_level: 'low' },
      response_format: { type: 'text', mime_type: 'application/json', schema },
    },
    { fallbackModels: config.geminiTextFallbackModels }
  );
  const text = outputText(response);
  if (!text) throw new Error('Empty response from the pricing assistant.');
  return JSON.parse(text) as T;
}

/** Runs the three steps in order, reporting each result as it lands. */
export async function researchPrice(
  input: ResearchInput,
  onStage: (stage: ResearchStage, result: ProductAnalysis | MarketScan | PriceVerdict) => void
): Promise<MarketResearch> {
  const languageName = getLanguageInfo(input.language).label;
  const photo = await photoToBase64OrNull(input.photoUri, 1024);

  const analysis = await ask<ProductAnalysis>(
    [
      ...(photo ? [{ type: 'image' as const, mime_type: 'image/jpeg', data: photo }] : []),
      {
        type: 'text',
        text: [
          'Step 1 of 3: identify this handmade product for pricing.',
          input.craft ? `The artisan's craft: ${input.craft}.` : '',
          input.title ? `Listing title: ${input.title}` : '',
          input.transcript ? `The artisan said (in ${languageName}): """${input.transcript}"""` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      },
    ],
    ANALYSIS_SCHEMA
  );
  onStage('analysis', analysis);

  const market = await ask<RawMarket>(
    [
      {
        type: 'text',
        text: [
          'Step 2 of 3: compare the Indian market for this product.',
          `Product: ${analysis.product}. Craft: ${analysis.craft}. Material: ${analysis.material}. Size: ${analysis.size}. Finish: ${analysis.finish}.`,
          'List three comparable handmade products sold in India today with their realistic retail prices, then the typical retail band for this product.',
        ].join('\n'),
      },
    ],
    MARKET_SCHEMA
  );
  const scan: MarketScan = {
    comparables: market.comparables.slice(0, 3).map((c) => ({ description: c.description, channel: c.channel, price: c.price_inr })),
    low: market.typical_low_inr,
    high: market.typical_high_inr,
    demandNote: market.demand_note,
  };
  onStage('market', scan);

  const verdict = await ask<RawVerdict>(
    [
      {
        type: 'text',
        text: [
          'Step 3 of 3: recommend a listing price.',
          `Product: ${analysis.product} (${analysis.craft}, ${analysis.material}, ${analysis.size}).`,
          `Market band: ₹${scan.low}–₹${scan.high}. Comparables: ${scan.comparables.map((c) => `${c.description} ₹${c.price} on ${c.channel}`).join('; ')}.`,
          input.costFloor > 0
            ? `The artisan's material and labour cost is ₹${input.costFloor}. The recommended price must stay above this.`
            : 'The artisan has not entered their cost yet.',
          `Artisan language: ${languageName}. Write reason_local in ${languageName} script.`,
        ].join('\n'),
      },
    ],
    VERDICT_SCHEMA
  );
  const decided: PriceVerdict = {
    recommended: Math.max(verdict.recommended_price_inr, input.costFloor),
    low: verdict.range_low_inr,
    high: verdict.range_high_inr,
    reason: verdict.reason_en,
    reasonLocal: verdict.reason_local,
  };
  onStage('verdict', decided);

  return { analysis, market: scan, verdict: decided };
}
