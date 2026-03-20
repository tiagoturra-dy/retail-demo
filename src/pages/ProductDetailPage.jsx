import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogService } from '../services/catalogService';
import { useCart } from '../context/CartContext';
import { Star, ShoppingBag, Heart, Shield, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

export const ProductDetailPage = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      const data = await catalogService.getProductById(productId);
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/" className="text-zinc-500 underline mt-4 block">Return Home</Link>
      </div>
    );
  }

  return (
    <div id={`product-detail-${product.id}`} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 product-detail-container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Image Gallery */}
        <div id="product-gallery" className="space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-100"
          >
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-zinc-100 cursor-pointer hover:opacity-80 transition-opacity">
                <img src={`https://picsum.photos/seed/${product.id}-${i}/200/200`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div id="product-info" className="flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-zinc-900">{product.category}</Link>
              <span>/</span>
              <span>{product.subcategory}</span>
            </div>
            <h1 id="product-name" className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200'}`} />
                ))}
              </div>
              <span className="text-sm text-zinc-500">{product.rating} ({product.reviews} reviews)</span>
            </div>
          </div>

          <p id="product-price" className="text-3xl font-bold text-zinc-900 mb-8">${product.price}</p>

          <div className="space-y-8 mb-10">
            <div className="flex gap-4">
              <button
                id="add-to-cart-btn"
                onClick={() => addToCart(product)}
                className="flex-1 bg-zinc-900 text-white h-16 rounded-2xl font-bold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </button>
              <button id="wishlist-btn" className="w-16 h-16 rounded-2xl border-2 border-zinc-100 flex items-center justify-center hover:border-zinc-300 transition-colors cursor-pointer">
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div id="product-features" className="border-t border-zinc-100 pt-8 space-y-6">
            <div className="flex gap-4 feature-item">
              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Free Shipping</h4>
                <p className="text-sm text-zinc-500">Free standard shipping on orders over $150.</p>
              </div>
            </div>
            <div className="flex gap-4 feature-item">
              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Easy Returns</h4>
                <p className="text-sm text-zinc-500">30-day return policy for a full refund.</p>
              </div>
            </div>
            <div className="flex gap-4 feature-item">
              <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-zinc-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Secure Payment</h4>
                <p className="text-sm text-zinc-500">Your information is protected by 256-bit SSL encryption.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

