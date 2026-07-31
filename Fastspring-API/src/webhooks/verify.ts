import crypto from "node:crypto";
import { config } from "../config.js";

// FastSpring signs webhook deliveries with HMAC-SHA256 over the raw request
// body, base64-encoded, in the `X-FS-Signature` header. Verification must run
// against the exact raw bytes received - not a re-serialized JSON object -
// which is why the route captures rawBody before parsing (see routes/webhooks.ts).
export function verifyFastSpringSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
  if (!signatureHeader) return false;

  const expected = crypto
    .createHmac("sha256", config.fastspringWebhookSecret)
    .update(rawBody)
    .digest("base64");

  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signatureHeader);

  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}
