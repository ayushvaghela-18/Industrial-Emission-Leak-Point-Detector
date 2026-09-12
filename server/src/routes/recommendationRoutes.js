/**
 * EcoForge AI — Recommendation Routes
 * Primary Ownership: Member 3 (Circular Recommendation & AI Copilot)
 */

import { Router } from 'express';
import {
  generateRecommendationsHandler,
  getRecommendationsByFactoryHandler,
  getMLStatusHandler,
} from '../services/recommendations/recommendationController.js';

const router = Router();

// GET /api/recommendations/ml-status
router.get('/ml-status', getMLStatusHandler);

// POST /api/recommendations/generate
router.post('/generate', generateRecommendationsHandler);

// GET /api/recommendations/:factoryId
router.get('/:factoryId', getRecommendationsByFactoryHandler);

export default router;
