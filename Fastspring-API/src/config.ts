import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),

  // Basic Auth credentials from FastSpring dashboard: Integrations > API Credentials.
  // Use the credentials generated for your TEST (sandbox) store.
  fastspringUsername: required("FASTSPRING_USERNAME"),
  fastspringPassword: required("FASTSPRING_PASSWORD"),

  // For a standard public sandbox store this is api.fastspring.com (same
  // host as live; sandbox vs live is determined by which store's credentials
  // you use). Internal FastSpring QA environments are different: each QA
  // environment (qa0, qa1, qa2, ...) has its own API host, e.g.
  // https://qa0-api.fastspring.com - a storefront domain like
  // "yourstore.test.qa.onfastspring.com" (no number) is QA0.
  fastspringApiBase: process.env.FASTSPRING_API_BASE ?? "https://api.fastspring.com",

  // Full data-storefront value for Popup Checkout, including the /popup
  // suffix, e.g. "mystore.test.onfastspring.com/popup" for a sandbox
  // store. Get it from: Checkouts > Popup Checkouts > your checkout >
  // "Place on your Website" - copy the value verbatim from that snippet.
  fastspringStorefront: required("FASTSPRING_STOREFRONT"),

  // HMAC secret configured on the webhook (Developer Tools > Webhooks).
  fastspringWebhookSecret: required("FASTSPRING_WEBHOOK_SECRET"),
};
