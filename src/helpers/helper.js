export const Helper = {
  getProductImage: (image) => {
    return image.startsWith('/') ? `https://se-demo-retail.use1.dev.pub.dydy.io/${image}` : image
  },
  getProducCategoriesDisplay: (categories) => {
    return categories.split('|').slice(0, 3).join(' • ')
  },
  /**
   * 1. Generates a random rating between 0 and 5.
   * @param {number} precision - Number of decimal places (default is 1).
   */
  getRandomRating: (precision = 1) => {
    const randomValue = Math.random() * 5;
    return parseFloat(randomValue.toFixed(precision));
  },

  /**
   * 2. Generates a random number of reviews.
   * @param {number} max - The upper limit of reviews (default 2500).
   */
  getRandomReviewCount: (max = 2500) => {
    return Math.floor(Math.random() * (max + 1));
  },
}