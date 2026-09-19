/**
 * All API keys live in .env as EXPO_PUBLIC_* variables (see .env.example).
 *
 * EXPO_PUBLIC_ values are bundled into the app, so anyone with the APK can
 * extract them. That is fine for development and demos. Before a public
 * release, move these calls behind a backend (e.g. Firebase Cloud Functions)
 * so the keys never ship in the app.
 */
const env = (value: string | undefined, fallback = '') => (value ?? '').trim() || fallback;

export const config = {
  // Google Gemini — photo studio (paid image model) plus free-tier listing writer and transcription.
  geminiApiKey: env(process.env.EXPO_PUBLIC_GEMINI_API_KEY),
  geminiImageModel: env(process.env.EXPO_PUBLIC_GEMINI_IMAGE_MODEL, 'gemini-2.5-flash-image'),
  geminiTextModel: env(process.env.EXPO_PUBLIC_GEMINI_TEXT_MODEL, 'gemini-3.1-flash-lite'),
  /** Tried when the main text model is overloaded. */
  geminiTextFallbackModels: ['gemini-3.5-flash-lite', 'gemini-3.6-flash'],

  // Optional premium providers; used instead of Gemini for their feature when set.
  anthropicApiKey: env(process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY),
  anthropicBaseUrl: env(process.env.EXPO_PUBLIC_ANTHROPIC_BASE_URL) || undefined,
  sarvamApiKey: env(process.env.EXPO_PUBLIC_SARVAM_API_KEY),
  sarvamSttModel: env(process.env.EXPO_PUBLIC_SARVAM_STT_MODEL, 'saarika:v2.5'),
  removeBgApiKey: env(process.env.EXPO_PUBLIC_REMOVE_BG_API_KEY),

  /**
   * Starts the app with sample data + demo photo studio already on, for a
   * device with no image quota. The Settings switch controls the same thing.
   */
  demoMode: env(process.env.EXPO_PUBLIC_DEMO_MODE) === '1',

  /** KarigarSetu Market Linkage API (server/). Listings are pushed here and relayed to ONDC, GeM and partners. */
  apiUrl: env(process.env.EXPO_PUBLIC_API_URL).replace(/\/$/, ''),

  // Firebase — placeholders for the upcoming backend; not wired up yet.
  firebase: {
    apiKey: env(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
    authDomain: env(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: env(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: env(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: env(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: env(process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
  },
};

const gemini = Boolean(config.geminiApiKey);

export const providers = {
  listing: config.anthropicApiKey ? 'claude' : gemini ? 'gemini' : null,
  speechToText: config.sarvamApiKey ? 'sarvam' : gemini ? 'gemini' : null,
  // 'demo' only as a last resort: with sample data on, isDemoMode() takes over at call time.
  studio: gemini ? 'gemini' : config.removeBgApiKey ? 'remove.bg' : config.demoMode ? 'demo' : null,
} as const;

export const services = {
  ai: providers.listing !== null,
  speechToText: providers.speechToText !== null,
  studio: providers.studio !== null,
  marketplaceApi: Boolean(config.apiUrl),
};
