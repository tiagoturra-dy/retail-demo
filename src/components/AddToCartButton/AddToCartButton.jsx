import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const AddToCartButton = ({ product, className, showText = false, iconClass }) => {
  const { addToCart } = useCart();

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

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
    });
  };

  return (
    <button
      onClick={handleAdd}
      className={className}
      aria-label="Add to cart"
    >
      <ShoppingBag className={iconClass} />
      {showText && <span> Add to Cart</span>}
    </button>
  );
};
