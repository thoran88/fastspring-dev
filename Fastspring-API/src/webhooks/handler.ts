export interface FastSpringWebhookEvent {
  id: string;
  type: string;
  live: boolean;
  created: number;
  processed: boolean;
  data: Record<string, unknown>;
}

export interface FastSpringWebhookPayload {
  events: FastSpringWebhookEvent[];
}

// Add real fulfillment logic per event type here (grant access, update your
// DB, send a confirmation email, etc). Keep this fast and idempotent -
// FastSpring retries deliveries that don't get a 2xx response, so the same
// event id can arrive more than once.
export async function handleFastSpringEvent(event: FastSpringWebhookEvent): Promise<void> {
  switch (event.type) {
    case "order.completed":
      console.log(`[order.completed] order=${event.data.id} reference=${event.data.reference}`);
      break;

    case "subscription.activated":
      console.log(`[subscription.activated] subscription=${event.data.id}`);
      break;

    case "subscription.deactivated":
    case "subscription.canceled":
      console.log(`[${event.type}] subscription=${event.data.id}`);
      break;

    case "subscription.charge.completed":
      console.log(`[subscription.charge.completed] subscription=${event.data.subscription}`);
      break;

    default:
      console.log(`[unhandled event] ${event.type}`, event.data);
  }
}
