import { PRODUCTS } from '../constants';

export const personalizationService = {
  getRecommendations: async (userId?: string) => {
    console.log('Fetching recommendations for:', userId);
    // Return a subset of products as recommendations
    return PRODUCTS.slice(0, 4);
  },
  getPersonalizedBanners: async () => {
    return [
      {
        id: 'banner-1',
        title: 'Exclusive Offer for You',
        subtitle: 'Get 20% off your next purchase',
        image: 'https://picsum.photos/seed/promo/1200/400'
      }
    ];
  }
};
