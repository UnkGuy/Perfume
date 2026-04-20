// src/App.jsx
import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import { Loader2 } from 'lucide-react';

import WelcomePage from './pages/WelcomePage';
import CartDrawer from './components/common/CartDrawer';
import WishlistDrawer from './components/common/WishlistDrawer';
import Toast from './components/common/Toast';
import ChatWidget from './components/common/ChatWidget';

import { useAuth } from './contexts/AuthContext';
import { useShop } from './contexts/ShopContext';
import { useSettings } from './contexts/SettingsContext';

const LoginPage         = lazy(() => import('./pages/LoginPage'));
const ProductPage       = lazy(() => import('./pages/ProductPage'));
const CartPage          = lazy(() => import('./pages/CartPage'));
const ProfilePage       = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard    = lazy(() => import('./pages/AdminDashboard'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const NotFoundPage      = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-rich-black flex items-center justify-center">
    <Loader2 className="animate-spin text-gold-400" size={40} />
  </div>
);

function App() {
  const { userRole } = useAuth();
  const { toasts, removeToast } = useShop();
  const { settings } = useSettings();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      navigate('/reset-password', { replace: true });
      window.history.replaceState(null, '', window.location.pathname);
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') navigate('/reset-password');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Hide drawers/widgets from admins entirely */}
      {userRole !== 'admin' && <CartDrawer />}
      {userRole !== 'admin' && settings.features?.wishlist !== false && <WishlistDrawer />}
      {userRole !== 'admin' && settings.features?.chatWidget !== false && <ChatWidget />}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"               element={<WelcomePage />} />
          <Route path="/products"       element={<ProductPage />} />
          <Route path="/products/:id"   element={<ProductPage />} />
          
          {/* Admin Restricted Pages */}
          <Route path="/cart"           element={userRole === 'admin' ? <Navigate to="/admin" replace /> : <CartPage />} />
          <Route path="/login"          element={userRole === 'admin' ? <Navigate to="/admin" replace /> : <LoginPage />} />
          <Route path="/profile"        element={userRole === 'admin' ? <Navigate to="/admin" replace /> : <ProfilePage />} />
          <Route path="/reset-password" element={userRole === 'admin' ? <Navigate to="/admin" replace /> : <ResetPasswordPage />} />
          
          <Route
            path="/admin"
            element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;