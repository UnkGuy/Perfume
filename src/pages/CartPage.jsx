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

  // --- SEND TO MESSENGER INTEGRATION (UPGRADED) ---
  const handleCheckoutToChat = async () => {
    // 1. Ensure user is logged in
    if (!user) {
      if(showToast) showToast("Login Required", "Please sign in to message the seller.", "error");
      setCurrentPage('login');
      return;
    }

    setIsSending(true);
    const total = calculateTotal();

    try {
      // STEP 1: Create the main Order record
      // We use .select().single() to immediately get the newly generated Order ID back from the database
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ 
          user_id: user.id, 
          total_amount: total,
          status: 'pending' 
        }])
        .select() 
        .single();

      if (orderError) throw orderError;

      const orderId = orderData.id;

      // STEP 2: Create the Order Items
      // Map through the cart to format the data for our new order_items table
      const orderItemsToInsert = localItems.map(item => ({
        order_id: orderId,
        product_id: item.id, // The ID of the actual product
        quantity: item.quantity,
        price_at_time: item.price // Locks in the price in case it changes tomorrow
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // STEP 3: Send the Chat Message
      // We still need the lightweight array for the visual UI bubble
      const chatMetadataItems = localItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));
      
      const { error: messageError } = await supabase
        .from('messages')
        .insert([{ 
          sender_role: 'user', 
          content: `Hi! I would like to inquire about Order #${orderId}:`, // Added Order ID here!
          user_id: user.id,
          metadata: {
            type: 'order_inquiry',
            order_id: orderId,
            items: chatMetadataItems,
            total: total
          }
        }]);

      if (messageError) throw messageError;

      // --- SUCCESS ---
      if(showToast) showToast("Order Placed!", "Your order has been saved and sent to the seller.");
      
      // Clear the local cart visually
      setLocalItems([]);
      
      // Note: To clear the global cart in App.jsx, you would typically 
      // pass a clearCart() function as a prop and call it here.

    } catch (err) {
      console.error('Checkout error:', err);
      if(showToast) showToast("Error", "Could not process order. Please try again.", "error");
    } finally {
      setIsSending(false);
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