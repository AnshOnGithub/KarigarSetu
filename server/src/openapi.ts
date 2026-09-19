import { config } from './config.ts';

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: object) => ({ 'application/json': { schema } });
const ok = (description: string, schema: object) => ({ description, content: json(schema) });

export const openapi = {
  openapi: '3.1.0',
  info: {
    title: 'KarigarSetu Market Linkage API',
    version: '1.0.0',
    description:
      'Bridges artisan catalogues created in the KarigarSetu app to government e-marketplaces (GeM, ONDC, India Handmade) and B2B buyers.\n\n' +
      '**Two ways to integrate**\n' +
      '1. **Pull** — poll `GET /v1/catalog?updatedSince=…` (or the ONDC / CSV variants) for incremental sync.\n' +
      '2. **Push** — register a webhook; every publish, update and delist is POSTed to you, signed with HMAC-SHA256.\n\n' +
      'Orders placed on your platform are sent back with `POST /v1/orders`, and status changes by the artisan arrive as `order.status_changed` webhooks.\n\n' +
      '**Verifying webhooks**: header `X-KarigarSetu-Signature: t=<unix>,v1=<hex>` where `v1 = HMAC_SHA256(secret, "<t>.<raw body>")`. Reject if `t` is older than 5 minutes.',
  },
  servers: [{ url: config.publicUrl }],
  tags: [
    { name: 'Partner: catalogue', description: 'For government platforms and buyers (X-API-Key)' },
    { name: 'Partner: orders & webhooks' },
    { name: 'Artisan app', description: 'Used by the KarigarSetu mobile app (Bearer token)' },
    { name: 'Admin' },
  ],
  components: {
    securitySchemes: {
      partnerKey: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
      artisanToken: { type: 'http', scheme: 'bearer' },
      adminKey: { type: 'apiKey', in: 'header', name: 'X-Admin-Key' },
    },
    schemas: {
      CatalogItem: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'prd_x1Y2z3' },
          sku: { type: 'string', example: 'KS-X1Y2Z3AB' },
          status: { enum: ['published', 'unpublished', 'draft'] },
          title: { type: 'object', properties: { en: { type: 'string' }, hi: { type: ['string', 'null'] } } },
          description: {
            type: 'object',
            properties: {
              en: { type: 'string' },
              hi: { type: ['string', 'null'] },
              local: { type: ['object', 'null'], properties: { language: { type: 'string' }, text: { type: 'string' } } },
            },
          },
          highlights: { type: 'array', items: { type: 'string' } },
          category: { type: 'string', example: 'Home Decor' },
          hsnCode: { type: ['string', 'null'], example: '97019100' },
          materials: { type: ['string', 'null'] },
          price: { type: 'object', properties: { currency: { const: 'INR' }, value: { type: 'integer' }, mrp: { type: 'integer' } } },
          stock: { type: 'integer' },
          images: { type: 'array', items: { type: 'string', format: 'uri' } },
          channels: { type: 'array', items: { enum: ['ONDC', 'GeM', 'B2B', 'INDIA_HANDMADE'] } },
          attributes: { type: 'object', properties: { handmade: { type: 'boolean' }, countryOfOrigin: { type: 'string' } } },
          artisan: {
            type: 'object',
            properties: {
              id: { type: 'string' }, name: { type: 'string' }, craft: { type: 'string' }, state: { type: ['string', 'null'] },
              district: { type: ['string', 'null'] }, pincode: { type: ['string', 'null'] }, udyamNumber: { type: ['string', 'null'] }, scheme: { type: ['string', 'null'] },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' }, externalOrderId: { type: 'string' }, productId: { type: 'string' }, channel: { type: 'string' },
          qty: { type: 'integer' }, unitPrice: { type: 'integer' }, total: { type: 'integer' },
          buyer: { type: 'object', properties: { name: { type: 'string' }, city: { type: 'string' }, type: { enum: ['consumer', 'government', 'business'] } } },
          status: { enum: ['new', 'accepted', 'packed', 'shipped', 'delivered', 'cancelled'] },
          createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      WebhookEvent: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { enum: ['product.published', 'product.updated', 'product.unpublished', 'order.status_changed'] },
          createdAt: { type: 'string', format: 'date-time' },
          data: { oneOf: [ref('CatalogItem'), ref('Order')] },
        },
      },
      Error: { type: 'object', properties: { error: { type: 'object', properties: { code: { type: 'string' }, message: { type: 'string' } } } } },
    },
  },
  paths: {
    '/v1/catalog': {
      get: {
        tags: ['Partner: catalogue'],
        summary: 'List published products (incremental sync with updatedSince + cursor)',
        security: [{ partnerKey: [] }],
        parameters: [
          { name: 'channel', in: 'query', schema: { enum: ['ONDC', 'GeM', 'B2B', 'INDIA_HANDMADE'] }, description: 'Ignored for single-channel partners' },
          { name: 'updatedSince', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Also returns unpublished items so you can delist them' },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'state', in: 'query', schema: { type: 'string' } },
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 100, maximum: 500 } },
          { name: 'cursor', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: ok('Page of products', { type: 'object', properties: { data: { type: 'array', items: ref('CatalogItem') }, nextCursor: { type: ['string', 'null'] } } }) },
      },
    },
    '/v1/catalog/ondc': {
      get: { tags: ['Partner: catalogue'], summary: 'Same feed in ONDC retail v1.2 on_search catalogue shape', security: [{ partnerKey: [] }], responses: { 200: { description: 'ONDC catalogue' } } },
    },
    '/v1/catalog/export.csv': {
      get: { tags: ['Partner: catalogue'], summary: 'Bulk-upload sheet (GeM / India Handmade / B2B), UTF-8 with Hindi columns', security: [{ partnerKey: [] }], responses: { 200: { description: 'CSV', content: { 'text/csv': {} } } } },
    },
    '/v1/catalog/{id}': {
      get: { tags: ['Partner: catalogue'], summary: 'Get one product', security: [{ partnerKey: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: ok('Product', { type: 'object', properties: { data: ref('CatalogItem') } }), 404: ok('Not found', ref('Error')) } },
    },
    '/v1/orders': {
      post: {
        tags: ['Partner: orders & webhooks'],
        summary: 'Send an order placed on your platform to the artisan (idempotent on externalOrderId)',
        security: [{ partnerKey: [] }],
        requestBody: { content: json({ type: 'object', required: ['externalOrderId', 'productId', 'qty', 'buyer'], properties: { externalOrderId: { type: 'string' }, productId: { type: 'string' }, qty: { type: 'integer' }, unitPrice: { type: 'integer' }, buyer: { type: 'object', properties: { name: { type: 'string' }, city: { type: 'string' }, type: { enum: ['consumer', 'government', 'business'] } } } } }) },
        responses: { 201: ok('Created', { type: 'object', properties: { data: ref('Order') } }), 409: ok('Out of stock', ref('Error')) },
      },
    },
    '/v1/orders/{id}': {
      get: { tags: ['Partner: orders & webhooks'], summary: 'Order status (by our id or your externalOrderId)', security: [{ partnerKey: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: ok('Order', { type: 'object', properties: { data: ref('Order') } }) } },
    },
    '/v1/webhooks': {
      post: {
        tags: ['Partner: orders & webhooks'],
        summary: 'Subscribe to push events. The signing secret is returned once.',
        security: [{ partnerKey: [] }],
        requestBody: { content: json({ type: 'object', required: ['url', 'events'], properties: { url: { type: 'string', format: 'uri' }, events: { type: 'array', items: { enum: ['product.published', 'product.updated', 'product.unpublished', 'order.status_changed'] } } } }) },
        callbacks: { event: { '{$request.body#/url}': { post: { requestBody: { content: json(ref('WebhookEvent')) }, responses: { 200: { description: 'Acknowledge with any 2xx; non-2xx is retried after 30s, 5m, 30m' } } } } } },
        responses: { 201: { description: 'Created' } },
      },
      get: { tags: ['Partner: orders & webhooks'], summary: 'List your webhooks', security: [{ partnerKey: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/v1/webhooks/{id}/deliveries': {
      get: { tags: ['Partner: orders & webhooks'], summary: 'Recent delivery attempts', security: [{ partnerKey: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/v1/webhooks/{id}': {
      delete: { tags: ['Partner: orders & webhooks'], summary: 'Remove a webhook', security: [{ partnerKey: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
    },
    '/v1/artisans': {
      post: { tags: ['Artisan app'], summary: 'Register artisan; returns a bearer token once', requestBody: { content: json({ type: 'object', required: ['name'], properties: { name: { type: 'string' }, craft: { type: 'string' }, language: { type: 'string' }, phone: { type: 'string' }, state: { type: 'string' }, district: { type: 'string' }, pincode: { type: 'string' }, udyamNumber: { type: 'string' }, scheme: { type: 'string', example: 'NSFDC' }, beneficiaryId: { type: 'string' } } }) }, responses: { 201: { description: 'Created' } } },
    },
    '/v1/artisans/me': {
      get: { tags: ['Artisan app'], summary: 'Current artisan', security: [{ artisanToken: [] }], responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Artisan app'], summary: 'Update profile', security: [{ artisanToken: [] }], responses: { 200: { description: 'OK' } } },
    },
    '/v1/me/products': {
      get: { tags: ['Artisan app'], summary: 'My products', security: [{ artisanToken: [] }], responses: { 200: { description: 'OK' } } },
      post: { tags: ['Artisan app'], summary: 'Create or update (by clientId) a listing; images as base64 or URLs', security: [{ artisanToken: [] }], responses: { 201: ok('Created', { type: 'object', properties: { data: ref('CatalogItem') } }) } },
    },
    '/v1/me/products/{id}': {
      patch: { tags: ['Artisan app'], summary: 'Update listing (price, stock, channels, status…)', security: [{ artisanToken: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Artisan app'], summary: 'Delist everywhere', security: [{ artisanToken: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Delisted' } } },
    },
    '/v1/me/orders': { get: { tags: ['Artisan app'], summary: 'Orders from all channels', security: [{ artisanToken: [] }], responses: { 200: { description: 'OK' } } } },
    '/v1/me/orders/{id}': { patch: { tags: ['Artisan app'], summary: 'Advance order status', security: [{ artisanToken: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } } },
    '/v1/partners': {
      post: { tags: ['Admin'], summary: 'Issue an API key to a platform (returned once)', security: [{ adminKey: [] }], requestBody: { content: json({ type: 'object', properties: { name: { type: 'string', example: 'GeM' }, channel: { enum: ['ONDC', 'GeM', 'B2B', 'INDIA_HANDMADE', '*'] } } }) }, responses: { 201: { description: 'Created' } } },
    },
  },
};
