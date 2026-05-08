import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';

export const analyticsRoutes = Router();

analyticsRoutes.get('/overview', analyticsController.overview);
analyticsRoutes.get('/deliverability', analyticsController.deliverability);
analyticsRoutes.get('/trend', analyticsController.trend);
analyticsRoutes.get('/export/overview', analyticsController.exportOverviewReport);
analyticsRoutes.get('/export/campaigns/:campaignId', analyticsController.exportCampaignReport);
analyticsRoutes.get('/campaigns/:campaignId', analyticsController.campaign);
analyticsRoutes.get('/campaigns/:campaignId/contacts', analyticsController.campaignContacts);
analyticsRoutes.get('/contacts/:contactId/timeline', analyticsController.contactTimeline);
