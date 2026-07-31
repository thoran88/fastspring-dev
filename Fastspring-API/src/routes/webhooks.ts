import { Router } from "express";
import { verifyFastSpringSignature } from "../webhooks/verify.js";
import { handleFastSpringEvent, type FastSpringWebhookPayload } from "../webhooks/handler.js";

export const webhookRouter = Router();

// Mounted with express.raw() in server.ts so req.body is the raw Buffer -
// signature verification needs the exact bytes FastSpring signed.
webhookRouter.post("/fastspring", async (req, res) => {
  const rawBody = req.body as Buffer;
  const signature = req.header("X-FS-Signature");

  if (!verifyFastSpringSignature(rawBody, signature)) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const payload = JSON.parse(rawBody.toString("utf8")) as FastSpringWebhookPayload;

  // Ack immediately, process after. FastSpring just wants a 2xx quickly;
  // a slow or failed handler shouldn't turn into a duplicate delivery storm.
  res.status(200).json({ received: true });

  for (const event of payload.events ?? []) {
    handleFastSpringEvent(event).catch((err) => {
      console.error(`Error handling event ${event.id} (${event.type})`, err);
    });
  }
});
