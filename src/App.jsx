import React, { useState } from 'react';

// Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard'; // <--- NEW IMPORT

// Components
import CartDrawer from './components/common/CartDrawer';
import WishlistDrawer from './components/common/WishlistDrawer';
import Toast from './components/common/Toast'; 
import ChatWidget from './components/common/ChatWidget';

// 1. Import our custom hooks!
import { useAuth } from './contexts/AuthContext';
import { useShop } from './contexts/ShopContext';

function App() {
  // --- UI STATES ---
  const [currentPage, setCurrentPage] = useState('welcome');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false); 
  const [searchQuery, setSearchQuery] = useState(''); 

  // 2. Simply grab all our logic from the invisible Context clouds!
  const { user, userRole, handleLogout } = useAuth(); // <--- GRAB USER ROLE HERE
  const { 
  cartItems, addToCart, removeFromCart, clearCart, // <--- Grab it here
  wishlistItems, toggleWishlist, 
  toasts, showToast, removeToast 
} = useShop();

  // Layout toggles
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleWishlistDrawer = () => setIsWishlistOpen(!isWishlistOpen);

  // --- PAGE ROUTER ---
  const renderCurrentPage = () => {
    const commonProps = { 
      setCurrentPage, cartItems, wishlistItems, 
      onCartClick: toggleCart, onWishlistClick: toggleWishlistDrawer, 
      searchQuery, setSearchQuery, showToast, 
      user, userRole, // <--- PASS DOWN TO COMPONENTS
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
      
      // 1. TEMPORARILY UNLOCKED THE VAULT
      case 'admin': return <AdminDashboard {...commonProps} />; 
          
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
        // --- ADD THESE NEW PROPS ---
        user={user}
        showToast={showToast}
      />
      
      <WishlistDrawer 
        isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} 
        wishlistItems={wishlistItems} toggleWishlist={toggleWishlist} addToCart={addToCart} 
      />

      {/* Hide ChatWidget for admins so it doesn't get in the way of their dashboard */}
      {userRole !== 'admin' && <ChatWidget user={user} />}

      {renderCurrentPage()}
    </div>
  );
}

export default App;