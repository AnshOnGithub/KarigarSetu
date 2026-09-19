import crypto from 'node:crypto';

export const newId = (prefix: string) => `${prefix}_${crypto.randomBytes(9).toString('base64url')}`;
export const newSecret = (prefix: string) => `${prefix}_${crypto.randomBytes(24).toString('base64url')}`;
export const hashSecret = (secret: string) => crypto.createHash('sha256').update(secret).digest('hex');
