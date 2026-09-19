import express from 'express';
import { config } from './config.ts';
import './db.ts';
import { errorHandler, HttpError } from './lib/http.ts';
import { openapi } from './openapi.ts';
import { artisans } from './routes/artisans.ts';
import { catalog } from './routes/catalog.ts';
import { artisanOrders, partnerOrders } from './routes/orders.ts';
import { partners, webhooks } from './routes/partners.ts';
import { products } from './routes/products.ts';
import { resumePendingDeliveries } from './webhooks.ts';

const app = express();
app.disable('x-powered-by');
// Listings carry base64 photos from the app.
app.use(express.json({ limit: '25mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});
app.get('/openapi.json', (_req, res) => {
  res.json(openapi);
});
app.get('/docs', (_req, res) => {
  res.type('html').send(`<!doctype html><html><head><title>KarigarSetu API</title><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"></head>
<body><div id="ui"></div><script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({ url: '/openapi.json', dom_id: '#ui' });</script></body></html>`);
});
app.use('/media', express.static(config.mediaDir, { immutable: true, maxAge: '365d', fallthrough: false }));

// Partner (government / marketplace) API
app.use('/v1/catalog', catalog);
app.use('/v1/orders', partnerOrders);
app.use('/v1/webhooks', webhooks);
app.use('/v1/partners', partners);

// Artisan app API
app.use('/v1/artisans', artisans);
app.use('/v1/me/products', products);
app.use('/v1/me/orders', artisanOrders);

app.use((_req, _res, next) => next(new HttpError(404, 'not_found', 'Route not found')));
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`KarigarSetu API on ${config.publicUrl}  ·  docs: ${config.publicUrl}/docs`);
  resumePendingDeliveries();
});
