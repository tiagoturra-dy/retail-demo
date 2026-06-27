/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from './components/Navbar/Navbar';
import { CategoriesSection } from './components/CategoriesSection/CategoriesSection';
import { Footer } from './components/Footer/Footer';
import { Home } from './pages/Home/Home';
import { CategoryPage } from './pages/CategoryPage/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage/ProductDetailPage';
import { CartPage } from './pages/CartPage/CartPage';
import { CheckoutPage } from './pages/CheckoutPage/CheckoutPage';
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
import { MuseProvider, useMuse } from './context/MuseContext';
import Clarity from '@microsoft/clarity';
import { useEffect } from 'react';

// Exposes openMuse globally so external scripts/banners can trigger it:
// window.__openMuse({ query: 'summer dresses' })
// window.__openMuse({ live: true })
const MuseGlobalBridge = () => {
  const { openMuse } = useMuse();

  useEffect(() => {
    window.__openMuse = (options) => openMuse(options);
    return () => {
      delete window.__openMuse;
    };
  }, [openMuse]);

  return null;
};

// Handles direct navigation to /muse (e.g. external links, bookmarks)
const MuseRoute = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openMuse } = useMuse();

  useEffect(() => {
    const q = searchParams.get('q');
    const live = searchParams.get('live') === '1';
    openMuse({ query: q || undefined, live });
    navigate('/', { replace: true });
  }, []);

  return null;
};

const LOGO_TEXT = 'BLUEBERRY';

export default function App() {
  useEffect(() => {
    const id = process.env.CLARITY_PROJECT_ID;
    if (id && process.env.NODE_ENV === 'production') {
      Clarity.init(id);
    }
  }, []);

  return (
    <AuthProvider>
      <ContentProvider>
        <CurrencyProvider>
          <CartProvider>
            <MuseProvider>
              <MuseGlobalBridge />
              <Router>
              <ScrollToTop />
              <DYManager />
              <div className="min-h-screen bg-white font-sans text-zinc-900">
                <Navbar logoText={LOGO_TEXT} />
                <CategoriesSection />
                <ShoppingMuse />
                <main>
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/category/:categoryName" element={<CategoryPage />} />
                      <Route path="/category/:categoryName/*" element={<NotFoundPage />} />
                      <Route path="/product/:productId" element={<ProductDetailPage />} />
                      <Route path="/product/:productId/*" element={<NotFoundPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/welcome" element={<WelcomeBackPage />} />
                      <Route path="/admin" element={<AdminDashboardPage />} />
                      <Route path="/search" element={<SearchResultsPage />} />
                      <Route path="/muse" element={<MuseRoute />} />
                      <Route path="/thank-you" element={<ThankYouPage />} />
                      <Route path="/my-page" element={<MyPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </AnimatePresence>
                </main>
                <Footer logoText={LOGO_TEXT} />
              </div>
            </Router>
            </MuseProvider>
          </CartProvider>
        </CurrencyProvider>
      </ContentProvider>
    </AuthProvider>
  );
}


