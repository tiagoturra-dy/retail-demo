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

/**
 * Returns true if the query contains any muse keyword.
 * Multi-word phrases are matched before single words.
 */
export const isMuseQuery = (query) => {
  const lower = query.toLowerCase();
  // Sort longest first so multi-word phrases are checked before substrings
  const sorted = [...MUSE_KEYWORDS].sort((a, b) => b.length - a.length);
  return sorted.some((keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![a-z])${escaped}`, 'i').test(lower);
  });
};
