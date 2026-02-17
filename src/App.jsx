import React, { useState } from 'react';
// Import Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import MessagesPage from './pages/MessagesPage';
import AdminPage from './pages/AdminPage';

// Import Components
import CartDrawer from './components/CartDrawer';
import Header from './components/Header';
import Toast from './components/Toast'; // NEW IMPORT

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]); // NEW: Wishlist State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]); // NEW: Toast State

  // --- TOAST LOGIC ---
  const showToast = (title, message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    // Auto remove after 3 seconds
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- CART & WISHLIST LOGIC ---
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

  const renderCurrentPage = () => {
    const commonProps = { 
      setCurrentPage, 
      cartItems, 
      wishlistItems, // Pass wishlist to all pages
      onCartClick: toggleCart,
      showToast // Pass toast trigger to all pages
    };
    
    switch (currentPage) {
      case 'welcome': return <WelcomePage {...commonProps} />;
      case 'login': return <LoginPage setCurrentPage={setCurrentPage} />;
      case 'products': return <ProductPage {...commonProps} addToCart={addToCart} toggleWishlist={toggleWishlist} />;
      case 'cart': return <CartPage {...commonProps} removeFromCart={removeFromCart} />;
      case 'messages': return <MessagesPage {...commonProps} />;
      case 'admin': return <AdminPage />;
      default: return <WelcomePage {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans">
      
      {/* GLOBAL TOAST CONTAINER */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* GLOBAL CART DRAWER */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems} 
        removeFromCart={removeFromCart}
        setCurrentPage={setCurrentPage}
      />

      {renderCurrentPage()}
    </div>
  );
}

export default App;