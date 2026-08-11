import { personalizationService } from '../services/personalizationService.js'

export const MUSE_KEYWORDS = [
  // Question words
  'how', 'for', 'of', 'what', 'why', 'when', 'where', 'who', 'which', 'whose',
  // Modal verbs
  'can', 'could', 'would', 'should', 'will', 'might', 'may', 'do', 'does', 'did',
  // Pronouns
  'i', 'me', 'my', 'mine', 'we', 'us', 'our', 'ours', 'you', 'your', 'yours',
  // Being verbs
  'is', 'are', 'was', 'were', 'am', 'be', 'being', 'been',
  // Action intent
  'explain', 'show', 'tell', 'find', 'give', 'help', 'recommend', 'suggest', 'guide',
  'want', 'need', 'looking', 'interested', 'like', 'prefer', 'buy', 'purchase',
  // Comparison
  'compare', 'versus', 'vs', 'difference', 'better', 'cheaper', 'best', 'top',
  // Price / deals
  'price', 'cost', 'sale', 'discount', 'deal', 'offer', 'promo',
  // Product attributes
  'size', 'fit', 'color', 'availability', 'in stock', 'shipping', 'delivery',
  'return', 'refund', 'warranty', 'guarantee',
  // Positional
  'above', 'below', 'under', 'over', 'between', 'around', 'near', 'close to',
  // Multi-word phrases (checked first due to length)
  'how do i', 'can i', 'should i', 'do you', 'what is', 'which one', 'tell me',
  'step by step', 'walk me through', 'help me', 'how much', 'how long', 'how to',
];

let _activeKeywords = MUSE_KEYWORDS;
let _activeRegexTemplate = null;

const FETCH_TIMEOUT_MS = 800;

/**
 * Fetches AI trigger keywords (and optional regex template) from Dynamic Yield
 * with a 400ms timeout. Falls back to built-in MUSE_KEYWORDS and regex on failure.
 */
export const initMuseKeywords = async () => {
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), FETCH_TIMEOUT_MS)
    );
    const result = await Promise.race([personalizationService.getAITriggerConstants(), timeout]);
    console.log('[AITriggerConstants] Fetched from DY:', result);

    if (result?.keywords?.length > 0) {
      _activeKeywords = result.keywords;
    }
    if (result?.regex) {
      try {
        new RegExp(result.regex.replace('{query}', 'test'));
        _activeRegexTemplate = result.regex;
      } catch {
        console.warn('[AITriggerConstants] Invalid regex from DY, using default pattern.');
      }
    }
  } catch (e) {
    console.warn('[AITriggerConstants] Failed to fetch from DY, using defaults.', e.message);
  }
};

/**
 * Returns true if the query contains any muse keyword.
 * Multi-word phrases are matched before single words.
 */
export const isMuseQuery = (query) => {
  const lower = query.toLowerCase();
  // Sort longest first so multi-word phrases are checked before substrings
  const sorted = [..._activeKeywords].sort((a, b) => b.length - a.length);
  return sorted.some((keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = _activeRegexTemplate
      ? _activeRegexTemplate.replace('{query}', escaped)
      : `(?<![a-z])${escaped}(?![a-z])`;
    return new RegExp(pattern, 'i').test(lower);
  });
};
