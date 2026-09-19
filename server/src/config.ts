import path from 'node:path';

const env = (key: string, fallback: string) => (process.env[key] ?? '').trim() || fallback;

export const config = {
  port: Number(env('PORT', '8080')),
  publicUrl: env('PUBLIC_URL', 'http://localhost:8080').replace(/\/$/, ''),
  databaseFile: path.resolve(env('DATABASE_FILE', './data/karigarsetu.db')),
  mediaDir: path.resolve(env('MEDIA_DIR', './data/media')),
  adminApiKey: env('ADMIN_API_KEY', ''),
};
