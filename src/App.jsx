import React, { useState } from 'react';

// Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';

// Components
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import Toast from './components/Toast'; 
import ChatWidget from './components/ChatWidget';

// 1. Import our custom hooks!
import { useAuth } from './contexts/AuthContext';
import { useShop } from './contexts/ShopContext';

function App() {
  // --- UI STATES (App.jsx keeps these because they control layout) ---
  const [currentPage, setCurrentPage] = useState('welcome');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false); 
  const [searchQuery, setSearchQuery] = useState(''); 

  // 2. Simply grab all our logic from the invisible Context clouds!
  const { user, handleLogout } = useAuth();
  const { 
    cartItems, addToCart, removeFromCart, 
    wishlistItems, toggleWishlist, 
    toasts, showToast, removeToast 
  } = useShop();

  // Layout toggles
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleWishlistDrawer = () => setIsWishlistOpen(!isWishlistOpen);

  // --- PAGE ROUTER ---
  const renderCurrentPage = () => {
    // We pass these down just like before so your existing pages don't break!
    const commonProps = { 
      setCurrentPage, cartItems, wishlistItems, 
      onCartClick: toggleCart, onWishlistClick: toggleWishlistDrawer, 
      searchQuery, setSearchQuery, showToast, user, 
      handleLogout: async () => {
        await handleLogout();
        showToast('Logged Out', 'You have been successfully logged out.');
        setCurrentPage('welcome');
      }
    };
    
    switch (currentPage) {
      case 'welcome': return <WelcomePage {...commonProps} />;
      case 'products': return <ProductPage {...commonProps} addToCart={(p) => { addToCart(p); setIsCartOpen(true); }} toggleWishlist={toggleWishlist} />;
      case 'cart': return <CartPage {...commonProps} removeFromCart={removeFromCart} />;
      case 'login': return <LoginPage setCurrentPage={setCurrentPage} showToast={showToast} />;
      default: return <WelcomePage {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <CartDrawer 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems} removeFromCart={removeFromCart} setCurrentPage={setCurrentPage} 
      />
      
      <WishlistDrawer 
        isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} 
        wishlistItems={wishlistItems} toggleWishlist={toggleWishlist} addToCart={addToCart} 
      />

      <ChatWidget user={user} />

      {renderCurrentPage()}
    </div>
  );
}

export default App;