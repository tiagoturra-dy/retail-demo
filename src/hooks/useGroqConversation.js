import { useRef, useCallback } from 'react';
import { groqService } from '../services/groqService.js';
import { personalizationService } from '../services/personalizationService.js';

/**
 * Manages a Groq-powered qualifying conversation.
 * Once Groq outputs "MUSE PROMPT:", the extracted prompt is sent to the Muse API.
 *
 * Usage:
 *   const { sendToGroq, resetGroq } = useGroqConversation({ cart, onMessage, onMuseResult, onError });
 *
 * onMessage(text, isBot)  — called for each chat message to display
 * onMuseResult(response)  — called with the Muse API result { answer, widgets }
 * onError(message)        — called on any error
 */
export function useGroqConversation({ cart = [], lang = 'en-US', onMessage, onMuseResult, onError }) {
  const historyRef = useRef([]); // [{ role, content }]

  const sendToGroq = useCallback(async (userText, displayText) => {
    const trimmed = displayText?.trim();
    if (!trimmed) return;

    // Append user turn to history
    historyRef.current = [...historyRef.current, { role: 'user', content: trimmed }];
    onMessage?.(displayText || trimmed, false);

    try {
      const { content, musePrompt } = await groqService.chat(historyRef.current, lang);

      if (musePrompt) {
        // Groq decided criteria met — call Muse and return only Muse results
        const museResponse = await personalizationService.getMuseResponse({
          query: musePrompt,
          cart,
        });
        onMuseResult?.(museResponse);
      } else {
        // Normal qualifying question — show Groq reply
        historyRef.current = [...historyRef.current, { role: 'assistant', content }];
        onMessage?.(content, true);
      }
    } catch (err) {
      console.error('[useGroqConversation]', err);
      onError?.(err.message);
    }
  }, [cart, onMessage, onMuseResult, onError]);

  const resetGroq = useCallback(() => {
    historyRef.current = [];
  }, []);

  return { sendToGroq, resetGroq };
}
