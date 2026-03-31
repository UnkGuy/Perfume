import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

// Cart Components
import EmptyCart from '../components/cart/EmptyCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import SuggestedProducts from '../components/common/SuggestedProducts';
import { useShop } from '../contexts/ShopContext'; // <-- ADD THIS IMPORT
const CartPage = ({ 
  setCurrentPage, cartItems, removeFromCart, clearCart, 
  wishlistItems, onCartClick, onWishlistClick, 
  searchQuery, setSearchQuery, 
  user, userRole, handleLogout, showToast
}) => {
  
  // <-- ADD THIS LINE RIGHT HERE -->
  const { addToCart } = useShop(); 

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
    return (
      <EmptyCart 
        setCurrentPage={setCurrentPage} 
        cartItems={cartItems} 
        wishlistItems={wishlistItems}
        onCartClick={onCartClick}
        onWishlistClick={onWishlistClick}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        userRole={userRole}
        handleLogout={handleLogout}
      />
    );
  }

  // --- NEW: AGGREGATE NOTES FOR RECOMMENDATIONS ---
  // Combine all notes from all items in the cart into one array
  const cartNotes = localItems.flatMap(item => item.notes || []);
  // Grab the gender of the first item as a baseline (or default to Unisex)
  const cartGender = localItems.length > 0 ? localItems[0].gender : 'Unisex';
  
  // --- RENDER FULL CART ---
  return (
    <div className="min-h-screen bg-rich-black text-white font-sans selection:bg-gold-400 selection:text-black flex flex-col">
      <div className="relative z-50">
        <Header 
          setCurrentPage={setCurrentPage} cartItems={cartItems} wishlistItems={wishlistItems}
          onCartClick={onCartClick} onWishlistClick={onWishlistClick}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          user={user} userRole={userRole} handleLogout={handleLogout} 
        />
      </div>
      
      <div className="flex-1 container mx-auto px-6 py-32 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Your Selected Items</h1>
          <p className="text-gray-400">Review your items before messaging the seller</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          <div className="flex-1 space-y-6">
            {localItems.map((item, index) => (
              <CartItem 
                key={index} item={item} index={index} 
                handleQuantity={handleQuantity} handleRemove={handleRemove} setCurrentPage={setCurrentPage} 
              />
            ))}

            <button onClick={() => setCurrentPage('products')} className="flex items-center gap-2 text-gray-400 hover:text-white mt-8 transition-colors">
              <ArrowLeft size={16} /> Continue Shopping
            </button>
          </div>

          <CartSummary 
            localItems={localItems} calculateTotal={calculateTotal}
            hasUnavailableItems={hasUnavailableItems} user={user}
            showToast={showToast} setCurrentPage={setCurrentPage}
            onCheckoutSuccess={() => { setLocalItems([]); if (clearCart) clearCart(); }}
          />
        </div>

        {/* --- NEW: SUGGESTED PRODUCTS IN CART --- */}
        <SuggestedProducts 
          currentProductId={null} // Pass null so it doesn't filter out anything unnecessarily 
          referenceNotes={cartNotes}
          referenceGender={cartGender}
          onSelect={(product) => setCurrentPage('products')} // Route them back to shop to view it
          onAddToCart={addToCart} // Let them add directly from cart page!
          wishlistItems={wishlistItems}
          user={user}
          setCurrentPage={setCurrentPage}
          showToast={showToast}
        />

      </div>
      <Footer />
    </div>
  );
};

export default CartPage;