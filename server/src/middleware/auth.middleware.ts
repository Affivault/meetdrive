import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { supabaseAdmin } from '../config/supabase.js';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  // If API key middleware already authenticated, skip JWT validation
  if (req.userId && (req as any).authMethod === 'apikey') {
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    if (env.SUPABASE_JWT_SECRET) {
      // Fast path: verify the signature locally with the configured secret.
      const decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as {
        sub: string;
        email: string;
        exp: number;
      };
      if (!decoded || !decoded.sub) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      req.userId = decoded.sub;
      req.userEmail = decoded.email;
      next();
      return;
    }

    // Secure fallback (no local secret configured): validate the token with
    // Supabase itself. We must NEVER trust an unverified jwt.decode() here — that
    // would let a forged token impersonate any user. getUser() checks the
    // signature server-side. Set SUPABASE_JWT_SECRET to use the faster local path.
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    req.userId = data.user.id;
    req.userEmail = data.user.email ?? '';
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
