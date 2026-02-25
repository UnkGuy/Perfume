import React, { useState } from 'react';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
// Imports...
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer'; // NEW
import Toast from './components/Toast'; 

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  
  // GLOBAL STATES
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false); // NEW
  const [searchQuery, setSearchQuery] = useState(''); // NEW: Global Search
  const [toasts, setToasts] = useState([]); 

  // --- LOGIC ---
  const showToast = (title, message, type = 'success') => { /* Your existing toast logic */ };
  const removeToast = (id) => { /* Your existing logic */ };

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
      onWishlistClick: toggleWishlistDrawer, // Pass this to Header
      searchQuery,                           // Pass to Header & ProductPage
      setSearchQuery,                        // Pass to Header & ProductPage
      showToast 
    };
    
    switch (currentPage) {
      case 'welcome': return <WelcomePage {...commonProps} />;
      case 'login': return <LoginPage setCurrentPage={setCurrentPage} />;
      case 'products': return <ProductPage {...commonProps} addToCart={addToCart} toggleWishlist={toggleWishlist} />;
      case 'cart': return <CartPage {...commonProps} removeFromCart={removeFromCart} />;
      case 'admin': return <AdminPage />;
      default: return <WelcomePage {...commonProps} />;
    }
  };

return (
    <div className="min-h-screen bg-rich-black text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cartItems} removeFromCart={removeFromCart} setCurrentPage={setCurrentPage} />
      
      {/* NEW: WISHLIST DRAWER */}
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} wishlistItems={wishlistItems} toggleWishlist={toggleWishlist} addToCart={addToCart} />

      {/* Global Chat Widget */}
      {/* <ChatWidget /> */}

      {renderCurrentPage()}
    </div>
  );
}

export default App;