import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

// Cart Components
import EmptyCart from '../components/cart/EmptyCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import SuggestedProducts from '../components/common/SuggestedProducts';

// Hooks & Contexts
import { useShop } from '../contexts/ShopContext';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext'; // <-- NEW IMPORT

// ✨ NO PROPS ✨
const CartPage = () => {
  const { user } = useAuth();
  const { cartItems, addToCart, removeFromCart, clearCart, wishlistItems, showToast } = useShop();
  const { setCurrentPage } = useUI(); // Pull routing from Context

  const safeCartItems = cartItems || [];
  const [localItems, setLocalItems] = useState([]);

  useEffect(() => {
    const processedItems = safeCartItems.map(item => ({
      ...item,
      quantity: 1,
      isRemoving: false
    }));
    setLocalItems(processedItems);
  }, [cartItems]);

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
  const cartNotes = localItems.flatMap(item => item.notes || []);
  const cartGender = localItems.length > 0 ? localItems[0].gender : 'Unisex';
  
  if (localItems.length === 0) {
    return <EmptyCart />; // EmptyCart takes no props now!
  }

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans selection:bg-gold-400 selection:text-black flex flex-col">
      <div className="relative z-50">
        <Header /> 
      </div>
      
      <div className="flex-1 container mx-auto px-6 py-32 max-w-[1600px]">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Your Selected Items</h1>
          <p className="text-gray-400">Review your items before messaging the seller</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 mb-16">
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

          <CartSummary 
            localItems={localItems}
            calculateTotal={calculateTotal}
            hasUnavailableItems={hasUnavailableItems}
            user={user}
            showToast={showToast}
            setCurrentPage={setCurrentPage}
            onCheckoutSuccess={() => {
              setLocalItems([]);
              if (clearCart) clearCart(); 
            }}
          />
        </div>

        <SuggestedProducts 
          currentProductId={null} 
          referenceNotes={cartNotes}
          referenceGender={cartGender}
          onSelect={(product) => setCurrentPage('products')} 
          onAddToCart={addToCart} 
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