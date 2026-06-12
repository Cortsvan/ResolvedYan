import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/ai/suggest
 * Protected endpoint that returns an AI-generated suggestion for a ticket.
 */
router.post('/suggest', requireAuth, async (req, res) => {
  try {
    const { ticketId, description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Ticket description is required' });
    }

    // TODO: Integrate OpenAI, Gemini, or Claude API here.
    // Example placeholder logic:
    const suggestion = `Based on the description "${description}", I suggest checking the billing portal or resetting the password.`;
    const recommendedCategory = "Billing";

    res.json({
      suggestion,
      recommendedCategory,
      confidence: 0.89
    });
  } catch (error) {
    console.error('AI Suggestion error:', error);
    res.status(500).json({ error: 'Failed to generate AI suggestion' });
  }
});

export default router;
