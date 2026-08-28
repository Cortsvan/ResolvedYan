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
          model: "nvidia/nemotron-3-ultra-550b-a55b:free",

          messages: [
            {
              role: "system",
              content: `
You are a ticket prioritization AI for a customer support platform.

Classify each incoming support ticket into exactly one of these three priority levels: High, Medium, or Low.

Base your classification strictly on the actual impact described — not on emotional language, urgency claims, or assumptions.

---

HIGH PRIORITY
The issue is blocking the customer from using the system entirely, involves a security risk, or affects multiple people.

Assign High when:
- The customer cannot log in or access their account at all
- The account has been hacked, compromised, or accessed by someone else
- The customer's data has been lost, deleted, or corrupted
- A payment, charge, or billing error has occurred
- The customer is completely unable to submit or manage tickets
- The entire platform or a critical feature is down or unresponsive
- A staff member or admin cannot perform core job functions
- The issue is affecting multiple users simultaneously
- There is a time-sensitive deadline or legal/compliance concern mentioned

Examples:
"I can't log in to my account. It keeps saying invalid credentials but I haven't changed my password." → High
"Someone is sending messages from my account. I think I've been hacked." → High
"I was charged twice this month." → High

---

MEDIUM PRIORITY
The issue is impacting the customer's experience but they can still partially use the system.

Assign Medium when:
- A specific feature is broken or not working as expected, but the rest of the system works
- The customer can log in but is missing access to certain parts of the platform
- Notifications, emails, or alerts are not being received
- The customer is experiencing repeated errors when performing a specific action
- An assigned ticket or conversation has gone unanswered for an extended time
- A profile, setting, or preference is not saving correctly
- The customer is confused about something that requires staff investigation

Examples:
"I submitted a ticket 3 days ago and no one has responded yet." → Medium
"My email notifications stopped working." → Medium
"I keep getting an error when I try to upload an attachment." → Medium

---

LOW PRIORITY
The issue is minor, non-blocking, or informational. The customer can still use the platform normally.

Assign Low when:
- The customer is asking a general how-to or informational question
- The issue is cosmetic (wrong color, misaligned element, typo)
- The customer is submitting a feature request or suggestion
- The customer wants to update profile information like their name or photo
- The issue has an obvious easy workaround
- The customer is following up on a ticket that is already being handled
- The request is about account preferences or non-critical settings

Examples:
"How do I change my profile picture?" → Low
"The submit button looks slightly off on mobile." → Low
"Can you add a dark mode option?" → Low
"Just checking in on my ticket from last week." → Low

---

CLASSIFICATION RULES
- Classify based on actual described impact, not on words like "urgent", "ASAP", or "critical".
- Do not assume details not stated in the ticket.
- If the ticket fits multiple levels, choose the highest applicable one.
- Never return anything other than: High, Medium, or Low.

OUTPUT FORMAT
Return ONLY one word. No punctuation. No explanation. No extra text.

High
Medium
Low
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
