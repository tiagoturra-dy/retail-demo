/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar/Navbar';
import { Footer } from './components/Footer/Footer';
import { Home } from './pages/Home/Home';
import { CategoryPage } from './pages/CategoryPage/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage/ProductDetailPage';
import { CartPage } from './pages/CartPage/CartPage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { WelcomeBackPage } from './pages/WelcomeBackPage/WelcomeBackPage';
import { SearchResultsPage } from './pages/SearchResultsPage/SearchResultsPage';
import { ThankYouPage } from './pages/ThankYouPage/ThankYouPage';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { DYManager } from './components/DYManager/DYManager';
import { ScrollToTop } from './components/ScrollToTop/ScrollToTop';
import { CurrencyProvider } from './context/CurrencyContext';
import { AdminDashboardPage } from './pages/AdminDashboardPage/AdminDashboardPage';
import { MyPage } from './pages/MyPage/MyPage';
import { ContentProvider } from './context/ContentContext';
import { ShoppingMuse } from './pages/ShoppingMuse/ShoppingMuse';

const LOGO_TEXT = 'BLUEBERRY';

export default function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <CurrencyProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <DYManager />
              <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
                <Navbar logoText={LOGO_TEXT} />
                <main>
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/category/:categoryName" element={<CategoryPage />} />
                      <Route path="/category/:categoryName/*" element={<NotFoundPage />} />
                      <Route path="/product/:productId" element={<ProductDetailPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/welcome" element={<WelcomeBackPage />} />
                      <Route path="/admin" element={<AdminDashboardPage />} />
                      <Route path="/search" element={<SearchResultsPage />} />
                      <Route path="/muse" element={<ShoppingMuse />} />
                      <Route path="/thank-you" element={<ThankYouPage />} />
                      <Route path="/my-page" element={<MyPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </AnimatePresence>
                </main>
                <Footer logoText={LOGO_TEXT} />
              </div>
            </Router>
          </CartProvider>
        </CurrencyProvider>
      </ContentProvider>
    </AuthProvider>
  );
}


