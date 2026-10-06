/**
 * Product Comparison Helper
 * Generate comparison table data from product list
 */

export const generateComparisonData = (products) => {
  if (!products || products.length === 0) return { headers: [], rows: [] };

  // Extract all unique attributes across products
  const attributes = new Set();
  products.forEach(product => {
    attributes.add('Price');
    attributes.add('Stock');
    if (product.material) attributes.add('Material');
    if (product.color) attributes.add('Color');
    if (product.size) attributes.add('Size');
    if (product.brand) attributes.add('Brand');
    if (product.rating) attributes.add('Rating');
    if (product.description) attributes.add('Description');
  });

  const headers = Array.from(attributes).sort();

  const rows = products.map(product => ({
    id: product.id || product.sku,
    name: product.name,
    image: product.image,
    sku: product.sku,
    values: {
      'Price': product.price || product.salePrice || 'N/A',
      'Stock': product.stock !== undefined ? (product.stock > 0 ? 'In Stock' : 'Out of Stock') : 'N/A',
      'Material': product.material || 'N/A',
      'Color': product.color || 'N/A',
      'Size': product.size || 'N/A',
      'Brand': product.brand || 'N/A',
      'Rating': product.rating ? `${product.rating.toFixed(1)}★` : 'N/A',
      'Description': product.description || 'N/A'
    }
  }));

  return { headers, rows };
};

export const getProductAttributes = (product) => {
  return {
    name: product.name || '',
    price: product.price || product.salePrice || 0,
    image: product.image || product.imageUrl || '',
    description: product.description || '',
    material: product.material || '',
    color: product.color || '',
    size: product.size || '',
    brand: product.brand || '',
    rating: product.rating || 0,
    stock: product.stock || 0,
    sku: product.sku || product.id || ''
  };
};

export const filterProductsByAttribute = (products, attribute, value) => {
  return products.filter(p => {
    const attrValue = p[attribute];
    if (Array.isArray(attrValue)) {
      return attrValue.includes(value);
    }
    return attrValue === value;
  });
};
