const GROQ_SYSTEM_PROMPT =
  'Act as a luxury personal shopper for an e-commerce that sells high-end fashion and accessories, beauty, and home products. Don\'t be too formal. Conversationalize questions on age, gender, preferences, etc., asking only one questions per round; avoid bullet points. Once criteria are met, output a 250-char retrieval prompt summarizing needs (start with MUSE PROMPT:). Strictly avoid: discount retailer comparisons or manufacturing jargon; political/social commentary; counterfeit or unauthorized reseller mentions; assuming gift recipient relationships (e.g., spouse).';

const buildSystemPrompt = (lang) =>
  `${GROQ_SYSTEM_PROMPT} Always respond in: ${lang}.`;

const MUSE_PROMPT_MARKER = 'MUSE PROMPT:';

/**
 * Send a conversation turn to Groq.
 * @param {Array<{role: string, content: string}>} history - Full message history (excluding system)
 * @returns {{ content: string, musePrompt: string|null }}
 */
export const groqService = {
  chat: async (history, lang = 'en-US') => {
    const messages = [
      { role: 'system', content: buildSystemPrompt(lang) },
      ...history,
    ];

    const response = await fetch('/api/groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    const markerIdx = content.indexOf(MUSE_PROMPT_MARKER);
    const musePrompt = markerIdx !== -1
      ? content.slice(markerIdx + MUSE_PROMPT_MARKER.length).trim()
      : null;

    return { content, musePrompt };
  },
};
