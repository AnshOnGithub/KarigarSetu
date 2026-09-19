# KarigarSetu Market Linkage API

The KarigarSetu app turns an artisan's photo and voice note into a listing. This API is where those listings end up. Government e-marketplaces (GeM, ONDC, India Handmade) and B2B buyers connect to it to get the catalogue and to send orders back.

```
Artisan app ──POST /v1/me/products──▶  API  ──webhook (signed)──▶  GeM / ONDC seller app / partner
                                        ▲  ◀──GET /v1/catalog──────  (pull, incremental)
                                        └────POST /v1/orders────────  orders back to the artisan
```

## Run

```bash
cp .env.example .env   # set ADMIN_API_KEY
npm install
npm run dev            # http://localhost:8080/docs  (Swagger UI)
```

Requires Node 22.5+ (uses built-in `node:sqlite`, so there is nothing native to compile).

In the app's `.env`, set `EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:8080`. Published products sync automatically, and anything published while offline is retried when the phone reconnects.

## Onboard a platform

```bash
curl -X POST localhost:8080/v1/partners -H "X-Admin-Key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json" -d '{"name":"GeM","channel":"GeM"}'
# → { "apiKey": "ks_live_…" }   (shown once)
```

A partner registered for a single channel only sees products the artisan chose to sell on that channel. Use `"channel": "*"` for an aggregator.

## Integrate

| Need | Endpoint |
|---|---|
| Full or incremental catalogue | `GET /v1/catalog?updatedSince=<iso>&cursor=…` |
| ONDC retail `on_search` shape | `GET /v1/catalog/ondc` |
| Bulk-upload sheet (EN + HI columns) | `GET /v1/catalog/export.csv` |
| Real-time push | `POST /v1/webhooks` with events `product.published`, `product.updated`, `product.unpublished`, `order.status_changed` |
| Send an order to the artisan | `POST /v1/orders` (idempotent on `externalOrderId`, checks stock) |

**Webhook signature:** `X-KarigarSetu-Signature: t=<unix>,v1=<hex>`, where `v1 = HMAC_SHA256(secret, "<t>.<raw body>")`. Failed deliveries are retried after 30 s, 5 min and 30 min.

## Before production

- Replace SQLite with Postgres and move `/media` to object storage behind a CDN.
- Verify artisans with phone OTP (and Aadhaar/Udyam where a channel requires it) instead of anonymous registration.
- Move the Gemini, Claude and Sarvam calls out of the app and behind this API so provider keys are never shipped in the APK.
- Confirm the ONDC field mapping with your seller-side network participant, and the GeM category attributes with GeM.
