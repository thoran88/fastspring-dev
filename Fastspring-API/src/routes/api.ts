import { Router } from "express";
import { getOrder } from "../fastspring/orders.js";
import { getSubscription } from "../fastspring/subscriptions.js";

export const apiRouter = Router();

apiRouter.get("/orders/:id", async (req, res) => {
  try {
    res.json(await getOrder(req.params.id));
  } catch (err) {
    console.error("Failed to fetch order", err);
    res.status(502).json({ error: "Failed to fetch order" });
  }
});

apiRouter.get("/subscriptions/:id", async (req, res) => {
  try {
    res.json(await getSubscription(req.params.id));
  } catch (err) {
    console.error("Failed to fetch subscription", err);
    res.status(502).json({ error: "Failed to fetch subscription" });
  }
});
