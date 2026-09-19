/** Usage: npm run seed:partner -- "GeM" GeM */
import { db, now } from '../db.ts';
import { hashSecret, newId, newSecret } from '../lib/ids.ts';

const [name = 'Demo platform', channel = '*'] = process.argv.slice(2);
const id = newId('ptn');
const apiKey = newSecret('ks_live');
db.prepare('INSERT INTO partners (id, name, channel, key_hash, created_at) VALUES (?, ?, ?, ?, ?)').run(id, name, channel, hashSecret(apiKey), now());
console.log(JSON.stringify({ id, name, channel, apiKey }, null, 2));
