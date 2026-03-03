import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Cart Components
import EmptyCart from '../components/cart/EmptyCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

const CartPage = ({ 
  setCurrentPage, cartItems, removeFromCart, clearCart, 
  wishlistItems, onCartClick, onWishlistClick, 
  searchQuery, setSearchQuery, 
  user, handleLogout, showToast 
}) => {
  
  // --- STATE ---
  const [localItems, setLocalItems] = useState([]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const processedItems = cartItems.map(item => ({
      ...item,
      quantity: 1,
      isRemoving: false
    }));
    setLocalItems(processedItems);
  }, [cartItems]);

  // --- LOGIC HELPERS ---
  const handleQuantity = (index, delta) => {
    const newItems = [...localItems];
    if (newItems[index].quantity + delta >= 1) {
      newItems[index].quantity += delta;
      setLocalItems(newItems);
    }
  };

  const handleRemove = (index) => {
    const newItems = [...localItems];
    newItems[index].isRemoving = true;
    setLocalItems(newItems);

    setTimeout(() => {
      const filtered = localItems.filter((_, i) => i !== index);
      setLocalItems(filtered);
      removeFromCart(index); 
    }, 500);
  };

  const calculateTotal = () => {
    return localItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const hasUnavailableItems = localItems.some(item => !item.available);
  
  // --- RENDER EMPTY STATE ---
  if (localItems.length === 0) {
    return <EmptyCart setCurrentPage={setCurrentPage} cartItems={cartItems} />;
  }

  // --- RENDER FULL CART ---
  return (
    <div className="min-h-screen bg-rich-black text-white font-sans selection:bg-gold-400 selection:text-black flex flex-col">
      <div className="relative z-50">
        <Header 
          setCurrentPage={setCurrentPage} 
          cartItems={cartItems} 
          wishlistItems={wishlistItems}
          onCartClick={onCartClick}
          onWishlistClick={onWishlistClick}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          user={user}                 
          handleLogout={handleLogout} 
        />
      </div>
      
      <div className="flex-1 container mx-auto px-6 py-32 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Your Selected Items</h1>
          <p className="text-gray-400">Review your items before messaging the seller</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-6">
            {localItems.map((item, index) => (
              <CartItem 
                key={index} 
                item={item} 
                index={index} 
                handleQuantity={handleQuantity} 
                handleRemove={handleRemove} 
                setCurrentPage={setCurrentPage} 
              />
            ))}

            <button onClick={() => setCurrentPage('products')} className="flex items-center gap-2 text-gray-400 hover:text-white mt-8 transition-colors">
              <ArrowLeft size={16} /> Continue Shopping
            </button>
          </div>

          {/* This is where the magic happens! */}
          <CartSummary 
            localItems={localItems}
            calculateTotal={calculateTotal}
            hasUnavailableItems={hasUnavailableItems}
            user={user}
            showToast={showToast}
            setCurrentPage={setCurrentPage}
            onCheckoutSuccess={() => {
              // 1. Clear the local visual state
              setLocalItems([]);
              // 2. Clear the global state so the notification badge updates!
              if (clearCart) clearCart(); 
            }}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CartPage;