import type { IncomingMessage, ServerResponse } from 'http';

// Vercel serverless functions receive extended req/res objects
interface VercelReq extends IncomingMessage {
  method?: string;
  body?: any;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelRes extends ServerResponse {
  status(code: number): VercelRes;
  json(data: any): void;
}

/**
 * Vercel Serverless SMTP Relay
 *
 * Accepts email requests from the backend server and sends them
 * via SMTP. This bypasses Render's SMTP port block because Vercel
 * runs on AWS Lambda which allows outbound connections on all ports.
 *
 * POST /api/send-email
 * Authorization: Bearer <SMTP_RELAY_SECRET>
 */
export default async function handler(req: VercelReq, res: VercelRes) {
  // CORS headers for preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify shared secret
  const secret = process.env.SMTP_RELAY_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'SMTP_RELAY_SECRET not configured on Vercel' });
  }

  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader || authHeader !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized - check SMTP_RELAY_SECRET matches' });
  }

  const body = req.body || {};
  const {
    smtp_host,
    smtp_port,
    smtp_secure,
    smtp_user,
    smtp_pass,
    from,
    to,
    subject,
    html,
    text,
    message_id,
    headers,
  } = body;

  // Validate required fields
  if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass || !from || !to || !subject) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: 'smtp_host, smtp_port, smtp_user, smtp_pass, from, to, subject',
      received: Object.keys(body),
    });
  }

  if (!html && !text) {
    return res.status(400).json({
      error: 'Email must have at least one of: html, text',
    });
  }

  try {
    // Dynamic import to avoid bundling issues
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: Number(smtp_port),
      secure: smtp_secure ?? false,
      auth: { user: smtp_user, pass: smtp_pass },
      connectionTimeout: 15000,
      socketTimeout: 25000,
    });

    // Verify SMTP connection
    await transporter.verify();

    // Send
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html: html || undefined,
      text: text || undefined,
      messageId: message_id || undefined,
      headers: headers || undefined,
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });
  } catch (err: any) {
    console.error('[SMTP Relay] Error:', err.message);
    return res.status(502).json({
      success: false,
      error: err.message,
      code: err.code || undefined,
    });
  }
}
