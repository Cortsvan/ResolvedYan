import { getAiSuggestion } from '../services/aiService.js';

export const suggestAiResponse = async (req, res, next) => {
  try {
    const { description } = req.body;
    const result = await getAiSuggestion(description);
    res.json(result);
  } catch (error) {
    if (error.message === 'Ticket description is required') {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};
