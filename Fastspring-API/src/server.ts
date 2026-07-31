import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { checkoutRouter } from "./routes/checkout.js";
import { webhookRouter } from "./routes/webhooks.js";
import { apiRouter } from "./routes/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Raw body needed here for webhook signature verification - must come
// before express.json() below, and only applies to this path.
app.use("/webhooks", express.raw({ type: "application/json" }), webhookRouter);

app.use(express.json());

app.get("/config", (_req, res) => {
  res.json({ storefront: config.fastspringStorefront });
});

app.use("/api/checkout", checkoutRouter);
app.use("/api", apiRouter);

app.use(express.static(path.join(__dirname, "..", "public")));

app.listen(config.port, () => {
  console.log(`FastSpring sandbox demo running at http://localhost:${config.port}`);
});
