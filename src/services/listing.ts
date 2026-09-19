import Anthropic from '@anthropic-ai/sdk';
import { config, providers } from '@/config';
import { getLanguageInfo } from '@/i18n/languages';
import type { Language } from '@/types';
import { createInteraction, outputText } from './gemini';
import { photoToBase64OrNull } from './image';

export interface GeneratedListing {
  title: string;
  description: string;
  titleHi: string;
  descriptionHi: string;
  localDescription: string;
  highlights: string[];
  category: string;
  suggestedPrice: number | null;
  priceReason: string;
  source: 'ai' | 'local';
}

const LISTING_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'description', 'title_hi', 'description_hi', 'local_description', 'highlights', 'category', 'suggested_price_inr', 'price_reason'],
  properties: {
    title: { type: 'string', description: 'Buyer-facing English product title, 4-9 words.' },
    description: { type: 'string', description: 'Buyer-facing English description, 50-90 words.' },
    title_hi: { type: 'string', description: 'The title in Hindi (Devanagari), natural for Indian buyers, not a word-for-word transliteration.' },
    description_hi: { type: 'string', description: 'The description in Hindi (Devanagari), 50-90 words.' },
    local_description: { type: 'string', description: "The same description in the artisan's language and script." },
    highlights: { type: 'array', items: { type: 'string' }, description: 'Three short English selling points.' },
    category: { type: 'string', description: 'Marketplace category, e.g. Home Decor, Apparel, Jewellery.' },
    suggested_price_inr: { type: 'integer', description: 'Typical retail price in INR for comparable handmade items.' },
    price_reason: { type: 'string', description: 'One sentence explaining the price, written in the artisan language named in the user message (not English, unless that is their language).' },
  },
} as const;

let client: Anthropic | null = null;
function getClient() {
  if (!client) {
    client = new Anthropic({
      apiKey: config.anthropicApiKey,
      baseURL: config.anthropicBaseUrl,
      // Required outside Node. See the key-exposure note in src/config.ts.
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

const SYSTEM_PROMPT =
  'You write marketplace listings for Indian handmade products sold on ONDC, GeM and B2B channels. ' +
  "Use only facts from the photo and the artisan's words; never invent materials, sizes or certifications. " +
  'Write SEO-friendly copy: put the craft name, material and product type early in the title and naturally in the description. ' +
  'Write warmly and plainly, without hype or emojis. Price suggestions should reflect real Indian retail prices for comparable handmade goods.';

interface ListingInput {
  photoUri: string | null;
  transcript: string;
  language: Language;
  craft: string;
}

interface RawListing {
  title: string;
  description: string;
  title_hi: string;
  description_hi: string;
  local_description: string;
  highlights: string[];
  category: string;
  suggested_price_inr: number;
  price_reason: string;
}

function userText(input: ListingInput) {
  const languageName = getLanguageInfo(input.language).label;
  return [
    `Artisan's language: ${languageName}.`,
    input.craft ? `Artisan's craft: ${input.craft}.` : '',
    `What the artisan said about this product (may be in ${languageName}):`,
    `"""${input.transcript}"""`,
  ]
    .filter(Boolean)
    .join('\n');
}

function toListing(parsed: RawListing, source: GeneratedListing['source']): GeneratedListing {
  return {
    title: parsed.title,
    description: parsed.description,
    titleHi: parsed.title_hi ?? '',
    descriptionHi: parsed.description_hi ?? '',
    localDescription: parsed.local_description,
    highlights: (parsed.highlights ?? []).slice(0, 3),
    category: parsed.category,
    suggestedPrice: parsed.suggested_price_inr > 0 ? parsed.suggested_price_inr : null,
    priceReason: parsed.price_reason,
    source,
  };
}

/** Claude when configured, otherwise Gemini (free tier), otherwise a listing built from the artisan's words. */
export async function generateListing(input: ListingInput): Promise<GeneratedListing> {
  if (providers.listing === 'claude') return generateWithClaude(input);
  if (providers.listing === 'gemini') return generateWithGemini(input);
  return localListing(input.transcript);
}

async function generateWithClaude(input: ListingInput): Promise<GeneratedListing> {
  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  const photo = await photoToBase64OrNull(input.photoUri);
  if (photo) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/jpeg', data: photo },
    });
  }
  content.push({ type: 'text', text: userText(input) });

  const response = await getClient().beta.messages.create({
    model: 'claude-opus-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: LISTING_SCHEMA } },
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  });

  if (response.stop_reason === 'refusal') {
    throw new Error('The listing could not be generated for this product.');
  }
  const text = response.content.find((block) => block.type === 'text');
  if (!text || text.type !== 'text') throw new Error('Empty response from listing service.');
  return toListing(JSON.parse(text.text) as RawListing, 'ai');
}

async function generateWithGemini(input: ListingInput): Promise<GeneratedListing> {
  const geminiPhoto = await photoToBase64OrNull(input.photoUri);
  const response = await createInteraction({
    model: config.geminiTextModel,
    system_instruction: SYSTEM_PROMPT,
    input: [
      ...(geminiPhoto ? [{ type: 'image' as const, mime_type: 'image/jpeg', data: geminiPhoto }] : []),
      { type: 'text', text: userText(input) },
    ],
    generation_config: { thinking_level: 'low' },
    response_format: { type: 'text', mime_type: 'application/json', schema: LISTING_SCHEMA },
  }, { fallbackModels: config.geminiTextFallbackModels });
  const text = outputText(response);
  if (!text) throw new Error('Empty response from listing service.');
  return toListing(JSON.parse(text) as RawListing, 'ai');
}

/** Offline/demo listing built directly from the artisan's own words. */
export function localListing(transcript: string): GeneratedListing {
  const clean = transcript.trim().replace(/\s+/g, ' ');
  const firstSentence = clean.split(/[.।!?]/)[0]?.trim() ?? '';
  const words = firstSentence.split(' ').slice(0, 7).join(' ');
  const title = words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Handmade product';

  return {
    title,
    description: clean,
    titleHi: '',
    descriptionHi: '',
    localDescription: clean,
    highlights: ['Handmade by the artisan', 'Made in India', 'Each piece is unique'],
    category: 'Handicrafts',
    suggestedPrice: null,
    priceReason: '',
    source: 'local',
  };
}
