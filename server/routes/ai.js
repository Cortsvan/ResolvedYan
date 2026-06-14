import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { suggestAiResponse } from '../controllers/aiController.js';

const router = express.Router();

/**
 * POST /api/ai/suggest
 * Protected endpoint that returns an AI-generated suggestion for a ticket.
 */
router.post('/suggest', requireAuth, suggestAiResponse);

export default router;
