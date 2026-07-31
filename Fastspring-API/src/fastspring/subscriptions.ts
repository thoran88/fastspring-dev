import { fastspring } from "./client.js";

export async function getSubscription(subscriptionId: string) {
  const { data } = await fastspring.get(`/subscriptions/${subscriptionId}`);
  return data;
}
