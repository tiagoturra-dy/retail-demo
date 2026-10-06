import React from 'react';
import { X } from 'lucide-react';
import styles from './ProductComparisonTable.module.css';

export const ProductComparisonTable = ({ products, onClose, onProductClick }) => {
  if (!products || products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No products to compare</p>
        <button onClick={onClose} className={styles.closeButton}>
          Close
        </button>
      </div>
    );
  }

  // Extract all attributes from products
  const allAttributes = new Set();
  products.forEach(product => {
    if (product.price) allAttributes.add('Price');
    if (product.stock !== undefined) allAttributes.add('Stock');
    if (product.material) allAttributes.add('Material');
    if (product.color) allAttributes.add('Color');
    if (product.size) allAttributes.add('Size');
    if (product.brand) allAttributes.add('Brand');
    if (product.rating) allAttributes.add('Rating');
    if (product.description) allAttributes.add('Description');
  });

  const attributes = Array.from(allAttributes).sort();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Product Comparison</h2>
        <button onClick={onClose} className={styles.headerCloseButton} aria-label="Close">
          <X size={20} />
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.attributeColumn}>Attribute</th>
              {products.map((product, idx) => (
                <th key={idx} className={styles.productColumn}>
                  <div className={styles.productHeader}>
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.productImage}
                      />
                    )}
                    <div className={styles.productInfo}>
                      <p className={styles.productName}>{product.name}</p>
                      <p className={styles.productSku}>SKU: {product.sku}</p>
                    </div>
                    <button
                      onClick={() => onProductClick && onProductClick(product)}
                      className={styles.productButton}
                      title="View product"
                    >
                      View
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributes.map((attr, attrIdx) => (
              <tr key={attrIdx} className={attrIdx % 2 === 0 ? styles.evenRow : ''}>
                <td className={styles.attributeCell}>{attr}</td>
                {products.map((product, prodIdx) => (
                  <td key={prodIdx} className={styles.valueCell}>
                    <span className={styles.value}>
                      {getAttributeValue(product, attr)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const getAttributeValue = (product, attribute) => {
  const attributeMap = {
    'Price': () => product.price || product.salePrice || 'N/A',
    'Stock': () => product.stock !== undefined ? (product.stock > 0 ? 'In Stock' : 'Out of Stock') : 'N/A',
    'Material': () => product.material || 'N/A',
    'Color': () => product.color || 'N/A',
    'Size': () => product.size || 'N/A',
    'Brand': () => product.brand || 'N/A',
    'Rating': () => product.rating ? `${product.rating.toFixed(1)}★ (${product.reviewCount || 0})` : 'N/A',
    'Description': () => product.description || 'N/A'
  };

  const getter = attributeMap[attribute];
  return getter ? getter() : product[attribute] || 'N/A';
};
