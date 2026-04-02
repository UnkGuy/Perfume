import React, { useState, useEffect, Suspense, lazy } from 'react';
import { supabase } from './services/supabase'; 
import { Loader2 } from 'lucide-react';

// --- STANDARD IMPORTS (Loaded immediately) ---
import WelcomePage from './pages/WelcomePage';

// Components (Global UI elements loaded immediately)
import CartDrawer from './components/common/CartDrawer';
import WishlistDrawer from './components/common/WishlistDrawer';
import Toast from './components/common/Toast'; 
import ChatWidget from './components/common/ChatWidget';

// Hooks
import { useAuth } from './contexts/AuthContext';
import { useShop } from './contexts/ShopContext';

// --- LAZY IMPORTS (Loaded only when the user navigates to them) ---
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard')); 
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

// A simple loading fallback for when routes are downloading
const PageLoader = () => (
  <div className="min-h-screen bg-rich-black flex items-center justify-center">
    <Loader2 className="animate-spin text-gold-400" size={40} />
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  
  // UI States (We will move these to a UIContext later)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false); 
  const [searchQuery, setSearchQuery] = useState(''); 

  const { userRole } = useAuth(); 
  const { toasts, removeToast } = useShop();

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
  }, []);

  const renderCurrentPage = () => {
    const routeProps = { 
      setCurrentPage, 
      searchQuery, 
      setSearchQuery,
      onCartClick: () => setIsCartOpen(!isCartOpen), 
      onWishlistClick: () => setIsWishlistOpen(!isWishlistOpen)
    };
    
    switch (currentPage) {
      case 'welcome': return <WelcomePage {...routeProps} />;
      case 'products': return <ProductPage {...routeProps} />;
      case 'cart': return <CartPage {...routeProps} />;
      case 'login': return <LoginPage setCurrentPage={setCurrentPage} />;
      case 'profile': return <ProfilePage {...routeProps} />;
      case 'reset-password': return <ResetPasswordPage setCurrentPage={setCurrentPage} />;
      
      case 'admin': 
        if (userRole === 'admin') return <AdminDashboard setCurrentPage={setCurrentPage} />; 
        setCurrentPage('welcome');
        return null;
          
      default: return <WelcomePage {...routeProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        setCurrentPage={setCurrentPage} 
      />
      
      <WishlistDrawer 
        isOpen={isWishlistOpen} 
        onClose={() => setIsWishlistOpen(false)} 
      />

      {userRole !== 'admin' && <ChatWidget />}

      {/* Suspense handles the loading state while the lazy components are fetched */}
      <Suspense fallback={<PageLoader />}>
        {renderCurrentPage()}
      </Suspense>
    </div>
  );
}

export default App;