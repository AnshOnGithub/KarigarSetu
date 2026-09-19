import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/config';
import type { Language, Product, Profile } from '@/types';
import { photoToBase64 } from './image';

const TOKEN_KEY = 'karigarsetu:api-token';

class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  const response = await fetch(`${config.apiUrl}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (response.status === 204) return undefined as T;
  const json = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!response.ok) throw new ApiError(response.status, json.error?.message ?? `API request failed (${response.status})`);
  return json as T;
}

/** Registers the artisan on first sync and keeps the token on the phone. */
async function artisanToken(profile: Profile, language: Language): Promise<string> {
  const saved = await AsyncStorage.getItem(TOKEN_KEY);
  if (saved) return saved;
  const { token } = await request<{ token: string }>('/v1/artisans', {
    method: 'POST',
    body: { name: profile.name.trim() || 'Artisan', craft: profile.craft, language },
  });
  await AsyncStorage.setItem(TOKEN_KEY, token);
  return token;
}

async function withToken<T>(profile: Profile, language: Language, call: (token: string) => Promise<T>): Promise<T> {
  const token = await artisanToken(profile, language);
  try {
    return await call(token);
  } catch (error) {
    // Server data was reset: register again once.
    if (error instanceof ApiError && error.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      return call(await artisanToken(profile, language));
    }
    throw error;
  }
}

/**
 * Pushes a listing to the API, which relays it to every channel the artisan picked.
 * Uses the local product id as clientId, so retries update instead of duplicating.
 */
export async function pushProduct(product: Product, profile: Profile, language: Language): Promise<string> {
  const image = product.image && !product.remoteId ? [{ data: await photoToBase64(product.image, 1600), mimeType: 'image/jpeg' }] : [];
  const { data } = await withToken(profile, language, (token) =>
    request<{ data: { id: string } }>('/v1/me/products', {
      method: 'POST',
      token,
      body: {
        clientId: product.id,
        title: product.title,
        titleHi: product.titleHi || undefined,
        description: product.description,
        descriptionHi: product.descriptionHi || undefined,
        localDescription: product.localDescription || undefined,
        highlights: product.highlights,
        category: product.category ?? '',
        price: Math.max(1, Math.round(product.price)),
        stock: product.stock,
        images: image,
        channels: product.channels,
        status: product.status,
        costBreakdown: product.costBreakdown,
      },
    })
  );
  return data.id;
}

export async function unpublishProduct(remoteId: string, profile: Profile, language: Language): Promise<void> {
  await withToken(profile, language, (token) => request(`/v1/me/products/${remoteId}`, { method: 'DELETE', token }));
}

export const clearApiSession = () => AsyncStorage.removeItem(TOKEN_KEY);
