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

export const prioritizeTicket = async (subject, description) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn(
      "OPENROUTER_API_KEY is not set. Defaulting AI priority to Medium."
    );
    return "Medium";
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.5-flash-lite",

          messages: [
            {
              role: "system",
              content: `
You are the ticket prioritization AI for a customer support system.

Your task is to classify each customer ticket into exactly one of these
three priority levels:

High
Medium
Low

PRIORITIZATION RULES

HIGH PRIORITY
Use High when the issue has significant impact or requires prompt staff attention.

- Account security or account compromise
- Unauthorized access or suspicious activity
- Data loss or corrupted important data
- System or service is completely unavailable
- A critical feature is completely unusable
- Customer is unable to perform an important business-critical task
- Multiple users or customers are affected
- No reasonable workaround exists
- The issue is time-sensitive and delaying resolution could cause significant consequences

Example:
"Someone accessed my account and changed my password. I can't log in."
→ High


MEDIUM PRIORITY
Use Medium when the issue significantly affects the customer but is not critical.

- Important functionality is not working correctly
- Customer is partially blocked from completing a task
- Repeated errors or degraded functionality
- Issue affects the normal workflow but is not business-critical
- A workaround exists
- A single customer is affected
- Issue requires staff attention but does not require immediate intervention

Example:
"I can't generate my monthly report, but I can still access the rest of the system."
→ Medium


LOW PRIORITY
Use Low for non-urgent issues with little immediate impact.

- General questions
- How-to questions
- Minor bugs
- Cosmetic or UI issues
- Feature requests
- Suggestions
- Small inconveniences
- Issues with an easy workaround
- Requests that do not prevent the customer from using the system

Example:
"How can I change my profile picture?"
→ Low


IMPORTANT CLASSIFICATION RULES

- Base the priority on the actual impact and circumstances described in the ticket.
- Do not assign a higher priority simply because the customer uses words such as
  "urgent", "ASAP", "important", or "emergency".
- Do not assume facts that are not stated in the ticket.
- If multiple priority levels apply, choose the highest applicable priority.
- Never return Critical or any priority other than High, Medium, or Low.

OUTPUT FORMAT

Return ONLY one word:

High
Medium
Low

Do not explain your reasoning.
Do not return JSON.
Do not add punctuation.
Do not add any other text.
              `.trim(),
            },
            {
              role: "user",
              content: `Subject: ${subject}\n\nDescription: ${description}`,
            },
          ],

          temperature: 0.1,
        }),
      }
    );

    if (!response.ok) {
      console.error(
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
      return "Medium";
    }

    const data = await response.json();

    const resultText =
      data.choices?.[0]?.message?.content?.trim() || "";

    // Remove only common accidental punctuation/quotes.
    const normalized = resultText
      .replace(/^[`"' ]+|[`"' .,]+$/g, "")
      .trim();

    // Strict validation.
    const validPriorities = ["Low", "Medium", "High"];

    if (validPriorities.includes(normalized)) {
      return normalized;
    }

    console.warn(
      `AI returned an invalid priority: "${resultText}". Defaulting to Medium.`
    );

    return "Medium";
  } catch (error) {
    console.error("Failed to prioritize ticket via AI:", error);
    return "Medium";
  }
};
