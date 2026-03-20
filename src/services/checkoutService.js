export const checkoutService = {
  processCheckout: async (cart, total) => {
    console.log('Processing checkout for:', cart, 'Total:', total);
    // Mock API call to 3rd party service
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, orderId: `ORD-${Math.floor(Math.random() * 1000000)}` };
  }
};
