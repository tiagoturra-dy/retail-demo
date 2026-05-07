/**
 * Preferred TTS voice names per BCP-47 language tag.
 * Values are matched against SpeechSynthesisVoice.name (case-insensitive, partial match).
 * First entry in the array wins if found; falls back to next, then to any voice matching the language.
 */
export const VOICE_PREFERENCES = {
  'en-US': ['Google US English'],
  'en-GB': ['Google UK English Female'],
  'en-EU': ['Google UK English Female'],
  'es-CL': ['Google español'],
  'pt-BR': ['Google português do Brasil'],
};

/**
 * Resolves the best available SpeechSynthesisVoice for a given lang tag.
 * @param {string} lang - BCP-47 language tag e.g. 'en-US'
 * @returns {SpeechSynthesisVoice|null}
 */
export function resolveVoice(lang) {
  const voices = window.speechSynthesis.getVoices();
  const preferred = VOICE_PREFERENCES[lang] || [];

  for (const name of preferred) {
    const match = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
    if (match) return match;
  }

  // Fallback: any voice whose lang starts with the base language code
  const langBase = lang.split('-')[0].toLowerCase();
  return voices.find(v => v.lang.toLowerCase().startsWith(langBase)) ?? null;
}
