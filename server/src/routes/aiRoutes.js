/**
 * EcoForge AI — AI Copilot Routes
 * Primary Ownership: Member 3 (Circular Recommendation & AI Copilot)
 */

import { Router } from 'express';
import { aiChatHandler } from '../services/ai/aiController.js';

const router = Router();

// POST /api/ai/chat
router.post('/chat', aiChatHandler);

export default router;
