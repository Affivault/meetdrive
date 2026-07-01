import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import * as sseService from '../services/sse.service.js';
import { campaignsService } from '../services/campaigns.service.js';
import { smtpService } from '../services/smtp.service.js';

export const sseController = {
  async dashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await sseService.getHealthDashboard(req.userId!);
      res.json(data);
    } catch (err) { next(err); }
  },

  async selectSender(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { campaignId } = req.params;
      await campaignsService.assertOwnership(req.userId!, campaignId);
      const result = await sseService.selectBestSender(req.userId!, campaignId);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getCampaignPool(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await campaignsService.assertOwnership(req.userId!, req.params.campaignId);
      const pool = await sseService.getCampaignPool(req.params.campaignId);
      res.json({ account_ids: pool });
    } catch (err) { next(err); }
  },

  async setCampaignPool(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { account_ids } = req.body;
      if (!Array.isArray(account_ids)) {
        res.status(400).json({ error: 'account_ids must be an array' });
        return;
      }
      await campaignsService.assertOwnership(req.userId!, req.params.campaignId);
      await sseService.setCampaignPool(req.params.campaignId, account_ids);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async recordSend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await smtpService.assertOwnership(req.userId!, req.params.accountId);
      await sseService.recordSend(req.params.accountId);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async recordBounce(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await smtpService.assertOwnership(req.userId!, req.params.accountId);
      await sseService.recordBounce(req.params.accountId);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async recordOpen(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await smtpService.assertOwnership(req.userId!, req.params.accountId);
      await sseService.recordOpen(req.params.accountId);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
