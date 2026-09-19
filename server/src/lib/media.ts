import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.ts';
import { newId } from './ids.ts';
import { HttpError } from './http.ts';

const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX_BYTES = 8 * 1024 * 1024;

/** Stores a base64 image and returns its file name under /media. */
export function saveImage(base64: string, mimeType: string): string {
  const extension = EXTENSIONS[mimeType];
  if (!extension) throw new HttpError(422, 'invalid_image', `Unsupported image type ${mimeType}`);
  const bytes = Buffer.from(base64.replace(/^data:[^;]+;base64,/, ''), 'base64');
  if (bytes.length === 0 || bytes.length > MAX_BYTES) throw new HttpError(422, 'invalid_image', 'Image must be between 1 byte and 8 MB');
  const file = `${newId('img')}.${extension}`;
  fs.writeFileSync(path.join(config.mediaDir, file), bytes);
  return file;
}
