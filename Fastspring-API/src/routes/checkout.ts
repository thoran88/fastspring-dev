import { Router } from "express";
import { createSession } from "../fastspring/sessions.js";

export const checkoutRouter = Router();

// Body: { items: [{ product: "your-product-path", quantity: 1 }], contact: { name, email, country } }
// Returns the FastSpring session id the frontend hands to the storefront
// popup to open checkout with this exact cart.
checkoutRouter.post("/session", async (req, res) => {
  try {
    const { items, contact, account, tags } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "items (non-empty array) is required" });
      return;
    }

    if (!account && !contact) {
      res.status(400).json({ error: "either account or contact is required" });
      return;
    }

    const session = await createSession({ items, contact, account, tags });
    res.json({ id: session.id });
  } catch (err) {
    console.error("Failed to create FastSpring session", err);
    res.status(502).json({ error: "Failed to create checkout session" });
  }
});
