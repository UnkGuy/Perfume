// src/App.jsx  — respects settings.features flags
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
import { useSettings } from './contexts/SettingsContext';   // ← NEW

const LoginPage          = lazy(() => import('./pages/LoginPage'));
const ProductPage        = lazy(() => import('./pages/ProductPage'));
const CartPage           = lazy(() => import('./pages/CartPage'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard     = lazy(() => import('./pages/AdminDashboard'));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'));
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-rich-black flex items-center justify-center">
    <Loader2 className="animate-spin text-gold-400" size={40} />
  </div>
);

// Shown to customers when maintenance mode is on
const MaintenancePage = ({ message }) => (
  <div className="min-h-screen bg-rich-black flex flex-col items-center justify-center text-white text-center px-6">
    <img
      src="https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/assets-images/kl%20scents%20logo.jpg"
      alt="KL Scents" className="w-24 h-24 rounded-full object-cover mb-8 border border-white/10 shadow-2xl"
    />
    <h1 className="text-3xl font-bold mb-4">Be Right Back</h1>
    <p className="text-gray-400 max-w-md text-lg leading-relaxed">{message || 'We are down for maintenance. Please check back soon!'}</p>
  </div>
);

function App() {
  const { userRole } = useAuth();
  const { toasts, removeToast } = useShop();
  const { settings } = useSettings();  // ← NEW

  const location  = useLocation();
  const navigate  = useNavigate();

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

  // Maintenance mode — block customers but not admins
  const isMaintenanceMode = settings.maintenance?.enabled && userRole !== 'admin';

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />

      {!isMaintenanceMode && <CartDrawer />}
      {!isMaintenanceMode && settings.features?.wishlist !== false && <WishlistDrawer />}
      {userRole !== 'admin' && settings.features?.chatWidget !== false && !isMaintenanceMode && <ChatWidget />}

      {isMaintenanceMode ? (
        <MaintenancePage message={settings.maintenance?.message} />
      ) : (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"               element={<WelcomePage />} />
            <Route path="/products"       element={<ProductPage />} />
            <Route path="/products/:id"   element={<ProductPage />} />
            <Route path="/cart"           element={<CartPage />} />
            <Route path="/login"          element={<LoginPage />} />
            <Route path="/profile"        element={<ProfilePage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/admin"
              element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      )}
    </div>
  );
}

export default App;