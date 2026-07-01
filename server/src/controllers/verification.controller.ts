import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import * as verificationService from '../services/verification.service.js';

export const verificationController = {
  async verifyContact(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await verificationService.verifyContact(req.params.contactId, req.userId!);
      res.json(result);
    } catch (err) { next(err); }
  },

  async verifyEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: 'email is required' });
        return;
      }
      const result = await verificationService.verifyEmail(email);
      res.json(result);
    } catch (err) { next(err); }
  },

  async batchVerify(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { contact_ids } = req.body;
      const result = await verificationService.batchVerify(req.userId!, contact_ids);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getDcsStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await verificationService.getDcsStats(req.userId!);
      res.json(stats);
    } catch (err) { next(err); }
  },

  async getSuppressed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { campaignId } = req.params;
      const threshold = parseInt(req.query.threshold as string, 10) || 0;
      const contacts = await verificationService.getSuppressedContacts(campaignId, threshold, req.userId!);
      res.json(contacts);
    } catch (err) { next(err); }
  },
};
