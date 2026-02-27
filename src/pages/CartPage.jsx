import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Supabase
import { supabase } from '../lib/supabase';

// Cart Components
import EmptyCart from '../components/cart/EmptyCart';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

const CartPage = ({ cartItems, removeFromCart, setCurrentPage, showToast, user }) => {
  // --- STATE ---
  const [localItems, setLocalItems] = useState([]);
  const [isSending, setIsSending] = useState(false);

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

  // --- SEND TO MESSENGER INTEGRATION ---
  const handleCheckoutToChat = async () => {
    if (!user) {
      if(showToast) showToast("Login Required", "Please sign in to message the seller.", "error");
      setCurrentPage('login');
      return;
    }

    setIsSending(true);

    const orderItems = localItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));
    
    const { error } = await supabase
      .from('messages')
      .insert([{ 
        sender_role: 'user', 
        content: 'Hi! I would like to inquire about this order:',
        user_id: user.id, 
        metadata: {
          type: 'order_inquiry',
          items: orderItems,
          total: calculateTotal()
        }
      }]);

    setIsSending(false);

    if (error) {
      console.error('Error sending order:', error);
      if(showToast) showToast("Error", "Could not send message. Please try again.", "error");
    } else {
      if(showToast) showToast("Inquiry Sent!", "Check the chat widget to view your inquiry.");
    }
  };

  // --- RENDER EMPTY STATE ---
  if (localItems.length === 0) {
    return <EmptyCart setCurrentPage={setCurrentPage} cartItems={cartItems} />;
  }

  // --- RENDER FULL CART ---
  return (
    <div className="min-h-screen bg-rich-black text-white font-sans selection:bg-gold-400 selection:text-black flex flex-col">
      <div className="relative z-50">
        <Header setCurrentPage={setCurrentPage} cartItems={cartItems} />
      </div>
      
      <div className="flex-1 container mx-auto px-6 py-32 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Your Selected Items</h1>
          <p className="text-gray-400">Review your items before messaging the seller</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column: Items List */}
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

          {/* Right Column: Summary Panel */}
          <CartSummary 
            localItems={localItems}
            calculateTotal={calculateTotal}
            hasUnavailableItems={hasUnavailableItems}
            isSending={isSending}
            handleCheckoutToChat={handleCheckoutToChat}
          />

        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CartPage;