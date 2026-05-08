import { Router } from 'express';
import { saraController } from '../controllers/sara.controller.js';

export const saraRoutes = Router();

// Queue management
saraRoutes.get('/queue', saraController.getQueue);
saraRoutes.post('/generate-email', saraController.generateEmail);
saraRoutes.get('/stats', saraController.getStats);

// Classification and actions
saraRoutes.post('/classify/:messageId', saraController.classify);
saraRoutes.post('/approve/:messageId', saraController.approve);
saraRoutes.post('/dismiss/:messageId', saraController.dismiss);
