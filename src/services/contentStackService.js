export const contentStackService = {
  getEntry: async (contentType, entryId) => {
    console.log(`Fetching ContentStack entry: ${contentType}/${entryId}`);
    // Mock response for a banner
    if (contentType === 'hero_banner') {
      return {
        title: 'THE NEW STANDARD OF LUXURY',
        subtitle: 'Discover our latest arrivals and timeless classics.',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920',
        cta_text: 'Explore Now',
        cta_link: '/category/all'
      };
    }
    return null;
  }
};
