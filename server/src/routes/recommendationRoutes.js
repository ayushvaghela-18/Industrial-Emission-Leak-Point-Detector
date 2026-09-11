/**
 * EcoForge AI — Recommendation Routes
 * Primary Ownership: Member 3 (Circular Recommendation & AI Copilot)
 */

import { Router } from 'express';
import {
  generateRecommendationsHandler,
  getRecommendationsByFactoryHandler,
} from '../services/recommendations/recommendationController.js';

const router = Router();

// POST /api/recommendations/generate
router.post('/generate', generateRecommendationsHandler);

// GET /api/recommendations/:factoryId
router.get('/:factoryId', getRecommendationsByFactoryHandler);

export default router;
