import React, { useState, useEffect } from 'react';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';

import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import Toast from './components/Toast'; 

// NEW: Import Supabase
import { supabase } from './lib/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  
  // --- NEW: USER AUTH STATE ---
  const [user, setUser] = useState(null);

  // GLOBAL STATES
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [toasts, setToasts] = useState([]); 

  // --- AUTHENTICATION LISTENER ---
  useEffect(() => {
    // 1. Check if they are already logged in when they first open the app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Listen for any login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup listener when app closes
    return () => subscription.unsubscribe();
  }, []);

  // --- LOGIC ---
  const showToast = (title, message, type = 'success') => { /* Your toast logic */ };
  const removeToast = (id) => { /* Your toast logic */ };

  // --- NEW: LOGOUT FUNCTION ---
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast('Error', 'Trouble logging out.', 'error');
    } else {
      showToast('Logged Out', 'You have been successfully logged out.');
      setCurrentPage('welcome');
    }
  };

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
    setIsCartOpen(true);
    showToast("Added to Cart", `${product.name} is now in your bag.`);
  };

  const removeFromCart = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
    showToast("Removed", "Item removed from cart.", "error");
  };

  const toggleWishlist = (product) => {
    if (wishlistItems.some(item => item.id === product.id)) {
      setWishlistItems(wishlistItems.filter(item => item.id !== product.id));
      showToast("Removed from Wishlist", `${product.name} removed.`, "error");
    } else {
      setWishlistItems([...wishlistItems, product]);
      showToast("Saved to Wishlist", `${product.name} saved for later.`);
    }
  };

  {/* Global Chat Widget */}
  <ChatWidget user={user} />

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleWishlistDrawer = () => setIsWishlistOpen(!isWishlistOpen);

  const renderCurrentPage = () => {
    const commonProps = { 
      setCurrentPage, 
      cartItems, 
      wishlistItems, 
      onCartClick: toggleCart,
      onWishlistClick: toggleWishlistDrawer, 
      searchQuery,                           
      setSearchQuery,                        
      showToast,
      user,         // NEW: Pass user down so pages know who is logged in
      handleLogout  // NEW: Pass logout function
    };
    
    switch (currentPage) {
      case 'welcome': return <WelcomePage {...commonProps} />;
      case 'products': return <ProductPage {...commonProps} addToCart={addToCart} toggleWishlist={toggleWishlist} />;
      case 'cart': return <CartPage {...commonProps} removeFromCart={removeFromCart} />;
      case 'login': return <LoginPage setCurrentPage={setCurrentPage} showToast={showToast} />;
      default: return <WelcomePage {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} removeFromCart={removeFromCart} setCurrentPage={setCurrentPage} />
      
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} wishlistItems={wishlistItems} toggleWishlist={toggleWishlist} addToCart={addToCart} />

      {renderCurrentPage()}
    </div>
  );
}

export default App;