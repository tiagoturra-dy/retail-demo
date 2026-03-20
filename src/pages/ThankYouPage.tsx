import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const ThankYouPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || 'ORD-UNKNOWN';

  return (
    <div id="thank-you-page" className="max-w-7xl mx-auto px-4 py-32 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 id="thank-you-title" className="text-4xl font-bold tracking-tight">Thank You for Your Order!</h1>
        <p className="text-zinc-500 text-lg">
          Your order <span className="text-zinc-900 font-bold">{orderId}</span> has been placed successfully.
        </p>
        <p className="text-zinc-500 max-w-md mx-auto">
          We've sent a confirmation email with all the details. We'll notify you as soon as your items are on their way.
        </p>
        <div className="pt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-full font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
