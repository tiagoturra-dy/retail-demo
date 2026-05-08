const GROQ_SYSTEM_PROMPT =
  `Act as a conversational luxury personal shopper for high-end fashion, beauty, and home goods. Be empathetic and informal, asking only one question per turn regarding age, gender, or preferences without using bullet points. Once criteria are met, output a summary of exactly 250 characters or less starting with "MUSE PROMPT:". Strictly avoid discount brand comparisons, manufacturing jargon, political or social commentary, mentions of counterfeits or unauthorized resellers, and assuming specific relationships for gift recipients.`;

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
