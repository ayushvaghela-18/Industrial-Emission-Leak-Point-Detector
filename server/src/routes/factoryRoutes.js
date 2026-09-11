import express from 'express';
import {
  createFactory,
  getFactories,
  getFactoryById,
  seedFactories,
} from '../controllers/factoryController.js';
import { validateFactoryInput } from '../middleware/validateRequest.js';

const router = express.Router();

/**
 * Factory Routes
 * Primary Ownership: Member 2 (Backend & Emissions)
 */

router.get('/', getFactories);
router.post('/', validateFactoryInput, createFactory);
router.post('/seed', seedFactories);
router.get('/:id', getFactoryById);

export default router;
