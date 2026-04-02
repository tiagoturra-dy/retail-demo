import { nanoid } from 'nanoid';
import { personalizationService } from './personalizationService.js';

export const checkoutService = {
  processCheckout: async ({cart, total}) => {
    console.log('Processing checkout for:', cart, 'Total:', total);
    const orderId = `ORD-${nanoid(10)}`

    const eventTrack = await personalizationService.trackPurchase({
      orderId,
      total,
      cart
    });
    console.log('Purchase event tracked:', eventTrack);

    return { success: eventTrack.success, orderId };
  }
};
