import express from 'express';
import {
  analyzeEmissions,
  getEmissionsByFactory,
} from '../controllers/emissionController.js';
import { validateProcessDataInput } from '../middleware/validateRequest.js';

const router = express.Router();

/**
 * Emission Routes
 * Primary Ownership: Member 2 (Backend & Emissions)
 */

router.post('/analyze', validateProcessDataInput, analyzeEmissions);
router.get('/:factoryId', getEmissionsByFactory);

export default router;
