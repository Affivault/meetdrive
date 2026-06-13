import type { IncomingMessage, ServerResponse } from 'http';

interface Req extends IncomingMessage { method?: string; }
interface Res extends ServerResponse { status(code: number): Res; json(data: any): void; }

/**
 * Health check for the Vercel SMTP relay.
 * GET /api/health → confirms the relay function is deployed.
 */
export default async function handler(_req: Req, res: Res) {
  const hasSecret = !!process.env.SMTP_RELAY_SECRET;
  return res.status(200).json({
    relay: 'ok',
    timestamp: new Date().toISOString(),
    secretConfigured: hasSecret,
  });
}
