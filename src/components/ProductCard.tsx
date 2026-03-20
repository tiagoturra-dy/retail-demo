import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link to={`/product/${product.id}`}>
        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {product.subcategory}
            </span>
          </div>
        </div>
      </Link>
      <div className="mt-4 flex justify-between items-start">
        <div>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-sm font-medium text-zinc-900 group-hover:underline underline-offset-4">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-zinc-500">{product.rating} ({product.reviews})</span>
          </div>
          <p className="mt-2 text-sm font-bold text-zinc-900">${product.price}</p>
        </div>
        <button
          onClick={() => addToCart(product)}
          className="p-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
