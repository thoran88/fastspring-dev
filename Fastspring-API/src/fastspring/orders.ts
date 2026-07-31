import { fastspring } from "./client.js";

export async function getOrder(orderId: string) {
  const { data } = await fastspring.get(`/orders/${orderId}`);
  return data;
}
