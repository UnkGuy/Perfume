import React, { useEffect, Suspense, lazy } from 'react';
import { supabase } from './services/supabase'; 
import { Loader2 } from 'lucide-react';

import WelcomePage from './pages/WelcomePage';
import CartDrawer from './components/common/CartDrawer';
import WishlistDrawer from './components/common/WishlistDrawer';
import Toast from './components/common/Toast'; 
import ChatWidget from './components/common/ChatWidget';

// Contexts
import { useAuth } from './contexts/AuthContext';
import { useShop } from './contexts/ShopContext';
import { useUI } from './contexts/UIContext'; // <-- NEW IMPORT

const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard')); 
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-rich-black flex items-center justify-center">
    <Loader2 className="animate-spin text-gold-400" size={40} />
  </div>
);

function App() {
  // Pulling state directly from Contexts!
  const { userRole } = useAuth(); 
  const { toasts, removeToast } = useShop();
  const { currentPage, setCurrentPage } = useUI(); 

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setCurrentPage('reset-password');
      window.history.replaceState(null, '', window.location.pathname);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentPage('reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, [setCurrentPage]);

  const renderCurrentPage = () => {
    // ZERO PROPS PASSED DOWN!
    switch (currentPage) {
      case 'welcome': return <WelcomePage />;
      case 'products': return <ProductPage />;
      case 'cart': return <CartPage />;
      case 'login': return <LoginPage />;
      case 'profile': return <ProfilePage />;
      case 'reset-password': return <ResetPasswordPage />;
      
      case 'admin': 
        if (userRole === 'admin') return <AdminDashboard />; 
        setCurrentPage('welcome');
        return null;
          
      default: return <WelcomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <CartDrawer />
      <WishlistDrawer />
      {userRole !== 'admin' && <ChatWidget />}

      <Suspense fallback={<PageLoader />}>
        {renderCurrentPage()}
      </Suspense>
    </div>
  );
}

export default App;