import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
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
    let decoded: { sub: string; email: string; exp: number } | null = null;

    if (env.SUPABASE_JWT_SECRET) {
      // Verify signature when the JWT secret is configured
      decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET) as {
        sub: string;
        email: string;
        exp: number;
      };
    } else {
      // Fallback: decode without verification (relies on Supabase token issuance)
      decoded = jwt.decode(token) as {
        sub: string;
        email: string;
        exp: number;
      } | null;

      // Manual expiration check when not using jwt.verify()
      if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
        res.status(401).json({ error: 'Token expired' });
        return;
      }
    }

    if (!decoded || !decoded.sub) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.userId = decoded.sub;
    req.userEmail = decoded.email;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
