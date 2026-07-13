import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { AddToBagIcon } from '../../icons/AddToBagIcon/AddToBagIcon';

export const AddToCartButton = ({ product, quantity = 1, className, showText = false, iconClass, trackProductClick, showFeedback = false, size = 24 }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (trackProductClick
        && typeof trackProductClick === 'function'
    ) {
      trackProductClick();
    }

    // Handle both old and new structures
    const id = product.sku || product.id;
    const data = product.productData || product;
    const image = data.image_url || data.image;
    const category = data.categories ? data.categories[0] : data.category;
    const subcategory = data.categories ? data.categories[1] || data.categories[0] : data.subcategory;

    addToCart({ 
      id, 
      ...data, 
      image, 
      category, 
      subcategory 
    }, quantity);

    if (showFeedback) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };

  return (
    <button
      onClick={handleAdd}
      className={className}
      aria-label={added ? 'Added to cart' : 'Add to cart'}
      disabled={added}
    >
      {added ? 
        <Check className={iconClass} /> : 
        <AddToBagIcon size={size} className={iconClass} />
      }
      {showText && <span>{added ? ' Added to cart' : ' Add to Cart'}</span>}
    </button>
  );
};
