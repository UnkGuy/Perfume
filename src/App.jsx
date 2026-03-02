import React, { useState } from 'react';

// Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard'; // <--- NEW IMPORT

// Components
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import Toast from './components/Toast'; 
import ChatWidget from './components/ChatWidget';

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
    cartItems, addToCart, removeFromCart, 
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
      case 'cart': return <CartPage {...commonProps} removeFromCart={removeFromCart} />;
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
      
{/* 2. TEMPORARY DEV BUTTON (Delete this before you launch!) */}
      <button 
        onClick={() => setCurrentPage('admin')}
        className="fixed bottom-6 left-6 z-[100] bg-red-500 text-white px-4 py-2 rounded-md font-bold shadow-lg hover:bg-red-600 transition-colors"
      >
        DEV: Go to Admin
      </button>

      <CartDrawer 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems} removeFromCart={removeFromCart} setCurrentPage={setCurrentPage} 
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