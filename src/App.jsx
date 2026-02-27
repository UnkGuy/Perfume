import React, { useState, useEffect } from 'react';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';

import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import Toast from './components/Toast'; 

// NEW: Import ChatWidget so React knows what it is!
import ChatWidget from './components/ChatWidget';

// Import Supabase
import { supabase } from './lib/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  
  // --- USER AUTH STATE ---
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- LOGIC ---
  const showToast = (title, message, type = 'success') => { /* Your toast logic */ };
  const removeToast = (id) => { /* Your toast logic */ };

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
      user,         
      handleLogout  
    };
    
    switch (currentPage) {
      case 'welcome': return <WelcomePage {...commonProps} />;
      case 'products': return <ProductPage {...commonProps} addToCart={addToCart} toggleWishlist={toggleWishlist} />;
      case 'cart': return <CartPage {...commonProps} removeFromCart={removeFromCart} />;
      case 'login': return <LoginPage setCurrentPage={setCurrentPage} showToast={showToast} />;
      default: return <WelcomePage {...commonProps} />;
    }
  };

  // Components inside the return block!
  return (
    <div className="min-h-screen bg-rich-black text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} removeFromCart={removeFromCart} setCurrentPage={setCurrentPage} />
      
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} wishlistItems={wishlistItems} toggleWishlist={toggleWishlist} addToCart={addToCart} />

      {/* Global Chat Widget MOVED HERE */}
      <ChatWidget user={user} />

      {renderCurrentPage()}
    </div>
  );
}

export default App;