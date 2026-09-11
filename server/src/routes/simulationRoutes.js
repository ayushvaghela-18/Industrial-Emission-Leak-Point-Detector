import express from 'express';
import { runSimulation } from '../controllers/simulationController.js';
import { validateSimulationInput } from '../middleware/validateRequest.js';

const router = express.Router();

/**
 * Simulation Routes
 * Primary Ownership: Member 2 (Backend & Emissions)
 */

router.post('/', validateSimulationInput, runSimulation);

export default router;
