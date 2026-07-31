import { fastspring } from "./client.js";

export interface SessionItem {
  product: string;
  quantity?: number;
}

export interface SessionContact {
  name: string;
  email: string;
  // Required for new buyers - omitting it defaults to US/USD.
  country: string;
  company?: string;
  phone?: string;
  language?: string;
}

export interface CreateSessionInput {
  items: SessionItem[];
  // Either an existing FastSpring account ID, or inline contact details for
  // a new buyer (FastSpring associates an existing account by email if one
  // matches). One of the two is required.
  account?: string;
  contact?: SessionContact;
  tags?: Record<string, string>;
}

export interface FastSpringSession {
  id: string;
  [key: string]: unknown;
}

// POST /sessions - creates a checkout session server-side. The returned
// session id is handed to the storefront popup so the buyer never has to
// re-enter cart contents client-side.
export async function createSession(input: CreateSessionInput): Promise<FastSpringSession> {
  const { data } = await fastspring.post<FastSpringSession>("/sessions", input);
  return data;
}

export async function getSession(sessionId: string): Promise<FastSpringSession> {
  const { data } = await fastspring.get<FastSpringSession>(`/sessions/${sessionId}`);
  return data;
}
