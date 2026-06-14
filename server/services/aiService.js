export const getAiSuggestion = async (description) => {
  if (!description) throw new Error('Ticket description is required');

  // TODO: Integrate OpenAI, Gemini, or Claude API here.
  // Example placeholder logic:
  const suggestion = `Based on the description "${description}", I suggest checking the billing portal or resetting the password.`;
  const recommendedCategory = "Billing";

  return {
    suggestion,
    recommendedCategory,
    confidence: 0.89
  };
};
