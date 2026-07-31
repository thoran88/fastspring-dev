# FastSpring API + Webhook Integration (Sandbox)

End-to-end demo of accepting a payment through FastSpring's hosted Checkout
and reacting to the resulting webhook events. Runs entirely against your
FastSpring **test (sandbox)** store - no real charges.

## How it fits together

FastSpring is a merchant of record: you never handle card data directly.
Instead:

1. Your backend creates a **checkout session** via the FastSpring REST API
   (`POST /sessions` with `{ items: [{ product, quantity }], contact: { name,
   email, country } }`), describing what's in the cart and who's buying.
2. The browser opens FastSpring's hosted **Checkout** popup using that
   session (via the Store Builder Library / `fastspring-builder.min.js`).
3. The buyer pays on FastSpring's checkout UI.
4. FastSpring sends **webhooks** to your server (`order.completed`,
   `subscription.activated`, etc.). You verify the HMAC signature and run
   your own fulfillment logic from there.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in:
   - `FASTSPRING_USERNAME` / `FASTSPRING_PASSWORD` - API credentials for
     your **test store**, from the FastSpring dashboard under
     *Integrations > API Credentials*. If this is an internal FastSpring QA
     store (storefront domain has `test.qa*.onfastspring.com`), these
     credentials only work against that QA environment's own API host, not
     `api.fastspring.com` - see `FASTSPRING_API_BASE` below.
   - `FASTSPRING_STOREFRONT` - the full `data-storefront` value (including
     the `/popup` suffix) from *Checkouts > Popup Checkouts > your checkout
     > "Place on your Website"* - looks like
     `yourstore.test.onfastspring.com/popup`.
   - `FASTSPRING_WEBHOOK_SECRET` - the HMAC SHA256 Secret you set on your
     webhook, from *Developer Tools > Webhooks*. Point that webhook's URL at
     `https://<your-tunnel>/webhooks/fastspring` (see below for exposing
     localhost).
   - `FASTSPRING_API_BASE` - `https://api.fastspring.com` for a normal
     public sandbox store. For an internal QA store, use that QA
     environment's own API host instead, e.g. `https://qa0-api.fastspring.com`
     for QA0 (identifiable by a storefront domain like
     `yourstore.test.qa.onfastspring.com` with no number after `qa`).
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000, enter a real product path from your test
   store's product catalog, and try both checkout buttons.

## Receiving webhooks locally

FastSpring needs a public URL to deliver webhooks to. Use a tunnel, e.g.:

```bash
ngrok http 3000
```

Then set the webhook subscription URL in the FastSpring dashboard to
`https://<ngrok-id>.ngrok.io/webhooks/fastspring`, and watch this server's
console output as you complete a sandbox purchase.

## What to double check

A couple of details are account/version-specific and worth confirming
against your own FastSpring dashboard before you rely on them:

- The SBL script `src` and `data-storefront` value in `public/index.html`
  are copied from one specific account's checkout snippet - always get your
  own from *Checkouts > Popup Checkouts > your checkout > Place on your
  Website* rather than reusing these verbatim.
- Webhook event type names and payload shape for the specific events
  you care about - the dashboard's *Developer Tools > Webhooks* page has a
  "send test event" feature that's the fastest way to see real payloads.

## Project layout

```
src/
  config.ts              env var loading
  fastspring/
    client.ts             Basic Auth axios client
    sessions.ts            create/get checkout sessions
    orders.ts               look up an order
    subscriptions.ts         look up a subscription
  webhooks/
    verify.ts              HMAC-SHA256 signature check
    handler.ts              per-event-type fulfillment logic
  routes/
    checkout.ts             POST /api/checkout/session
    webhooks.ts               POST /webhooks/fastspring
    api.ts                    GET /api/orders/:id, /api/subscriptions/:id
  server.ts                Express app wiring
public/
  index.html              demo checkout page
```
