import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase'; // <-- Needed for Auth Listener

// Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard'; 
import ResetPasswordPage from './pages/ResetPasswordPage'; // <-- NEW PAGE

// Components
import CartDrawer from './components/common/CartDrawer';
import WishlistDrawer from './components/common/WishlistDrawer';
import Toast from './components/common/Toast'; 
import ChatWidget from './components/common/ChatWidget';

// Hooks
import { useAuth } from './contexts/AuthContext';
import { useShop } from './contexts/ShopContext';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false); 
  const [searchQuery, setSearchQuery] = useState(''); 

  const { user, userRole, handleLogout } = useAuth(); 
  const { cartItems, addToCart, removeFromCart, clearCart, wishlistItems, toggleWishlist, toasts, showToast, removeToast } = useShop();

  // --- 🪄 MAGIC: PASSWORD RESET LISTENER ---
  // When a user clicks the "Reset Password" link in their email, Supabase emits this event.
  // We catch it and automatically reroute them to our custom reset page!
  // --- 🪄 MAGIC: PASSWORD RESET LISTENER ---
  useEffect(() => {
    // 1. THE TAB 2 FIX: Check the URL immediately when a new tab opens
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setCurrentPage('reset-password');
      // Optional: Clean up the URL so it looks pretty
      window.history.replaceState(null, '', window.location.pathname);
    }

    // 2. THE TAB 1 CATCH: Listen for cross-tab auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentPage('reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleWishlistDrawer = () => setIsWishlistOpen(!isWishlistOpen);

  const renderCurrentPage = () => {
    const commonProps = { 
      setCurrentPage, cartItems, wishlistItems, 
      onCartClick: toggleCart, onWishlistClick: toggleWishlistDrawer, 
      searchQuery, setSearchQuery, showToast, user, userRole, 
      handleLogout: async () => {
        await handleLogout();
        showToast('Logged Out', 'You have been successfully logged out.');
        setCurrentPage('welcome');
      }
    };
    
    switch (currentPage) {
      case 'welcome': return <WelcomePage {...commonProps} />;
      case 'products': return <ProductPage {...commonProps} addToCart={addToCart} toggleWishlist={toggleWishlist} />;
      case 'cart': return <CartPage {...commonProps} removeFromCart={removeFromCart} clearCart={clearCart} />;
      case 'login': return <LoginPage setCurrentPage={setCurrentPage} showToast={showToast} />;
      case 'profile': return <ProfilePage {...commonProps} />;
      case 'reset-password': return <ResetPasswordPage setCurrentPage={setCurrentPage} showToast={showToast} />;
      
      // ADMIN PROTECTION
      case 'admin': 
        if (userRole === 'admin') return <AdminDashboard {...commonProps} />; 
        setCurrentPage('welcome');
        return null;
          
      default: return <WelcomePage {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems} 
        removeFromCart={removeFromCart} 
        setCurrentPage={setCurrentPage} 
        user={user}
        showToast={showToast}
      />
      
      <WishlistDrawer 
        isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} 
        wishlistItems={wishlistItems} toggleWishlist={toggleWishlist} addToCart={addToCart} 
      />

      {userRole !== 'admin' && <ChatWidget user={user} />}

      {renderCurrentPage()}
    </div>
  );
}

export default App;