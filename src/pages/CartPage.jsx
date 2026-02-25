import React, { useState, useEffect } from 'react';
import { Trash2, MessageSquare, Check, Plus, Minus, ShoppingBag, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import perfumeImage from '../assets/images/perfume.jpg';

// Import Supabase
import { supabase } from '../lib/supabase';

// Make sure you pass showToast from App.jsx if you haven't already!
const CartPage = ({ cartItems, removeFromCart, setCurrentPage, showToast }) => {
  const [localItems, setLocalItems] = useState([]);
  const [isSending, setIsSending] = useState(false); // To prevent double-clicking

  // Initialize with REAL data only. Removed the dummy data fallback.
  useEffect(() => {
    const processedItems = cartItems.map(item => ({
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
      removeFromCart(index); // Sync with App.jsx
    }, 500);
  };

  const calculateTotal = () => {
    return localItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const hasUnavailableItems = localItems.some(item => !item.available);

  // --- SEND TO MESSENGER INTEGRATION ---
  const handleCheckoutToChat = async () => {
    setIsSending(true);

    // 1. Format the cart items into a readable string
    const orderDetails = localItems
      .map(item => `• ${item.quantity}x ${item.name} (₱${item.price})`)
      .join('\n');
    
    const total = calculateTotal();
    
    const messageContent = `Hi! I would like to inquire about this order:\n\n${orderDetails}\n\nTotal Estimate: ₱${total.toLocaleString()}`;

    // 2. Send to Supabase
    const { error } = await supabase
      .from('messages')
      .insert([{ sender_role: 'user', content: messageContent }]);

    setIsSending(false);

    if (error) {
      console.error('Error sending order:', error);
      if(showToast) showToast("Error", "Could not send message. Please try again.", "error");
    } else {
      // 3. Success! Notify the user.
      if(showToast) showToast("Inquiry Sent!", "Your cart details have been sent to the seller.");
      
      // Optional: If you want to empty the cart after they inquire, you would call a prop here 
      // like clearCart() that you define in App.jsx. For now, we'll just leave them on the page.
    }
  };

  if (localItems.length === 0) {
    return (
      <div className="min-h-screen bg-rich-black text-white font-sans selection:bg-gold-400 selection:text-black flex flex-col">
        <Header setCurrentPage={setCurrentPage} cartItems={cartItems} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-gray-600 mb-6 border border-white/10">
            <ShoppingBag size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-3">Your Cart is Empty</h2>
          <p className="text-gray-400 mb-8 max-w-md">Looks like you haven't found your signature scent yet.</p>
          <button onClick={() => setCurrentPage('products')} className="px-8 py-4 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold rounded flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            Start Shopping <ArrowRight size={18} />
          </button>
        </div>
        <Footer />
      </div>
    );
  }

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
          
          <div className="flex-1 space-y-6">
            {localItems.map((item, index) => (
              <div key={index} className={`flex flex-col sm:flex-row gap-6 p-6 bg-white/5 border border-white/5 rounded-xl transition-all duration-500 ease-out ${item.isRemoving ? 'opacity-0 -translate-x-12' : 'opacity-100 translate-x-0'} hover:border-gold-400/30 group`}>
                <div onClick={() => setCurrentPage('products')} className="w-full sm:w-24 h-24 bg-white/10 rounded-lg overflow-hidden cursor-pointer flex-shrink-0">
                  <img src={perfumeImage} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 onClick={() => setCurrentPage('products')} className="font-bold text-lg cursor-pointer hover:text-gold-400 transition-colors">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.brand} • {item.size}</p>
                      
                      {item.available ? (
                        <div className="flex items-center gap-1 text-green-400 text-xs mt-2 bg-green-400/10 px-2 py-1 rounded w-fit">
                          <Check size={12} /> Available
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-400 text-xs mt-2 bg-red-400/10 px-2 py-1 rounded w-fit">
                          <AlertCircle size={12} /> Out of Stock
                        </div>
                      )}
                    </div>
                    
                    <button onClick={() => handleRemove(index)} className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-full">
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/5 pt-4">
                    <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/10">
                      <button onClick={() => handleQuantity(index, -1)} disabled={item.quantity <= 1} className="p-1 hover:text-gold-400 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors">
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-mono w-4 text-center">{item.quantity}</span>
                      <button onClick={() => handleQuantity(index, 1)} className="p-1 hover:text-gold-400 transition-colors">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-xl font-bold text-gold-400">
                      ₱{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <button onClick={() => setCurrentPage('products')} className="flex items-center gap-2 text-gray-400 hover:text-white mt-8 transition-colors">
              <ArrowLeft size={16} /> Continue Shopping
            </button>
          </div>

          <div className="w-full lg:w-96">
            <div className="bg-white/5 border border-gold-400/20 rounded-2xl p-8 sticky top-32 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-2">Ready to Purchase?</h2>
              <p className="text-sm text-gray-400 mb-8 pb-6 border-b border-white/10">
                Message the seller to arrange payment and delivery details.
              </p>
              
              <div className="space-y-3 mb-6 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {localItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      <span className="text-gold-400 font-bold mr-2">{item.quantity}x</span> 
                      {item.name}
                    </span>
                    <span className="text-gray-500">₱{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-xl font-bold text-white pt-6 border-t border-white/10 mb-8">
                <span>Total</span>
                <span>₱{calculateTotal().toLocaleString()}</span>
              </div>
              
              <button 
                onClick={handleCheckoutToChat}
                disabled={hasUnavailableItems || isSending}
                className={`w-full py-4 font-bold rounded flex items-center justify-center gap-2 transition-all shadow-lg
                  ${(hasUnavailableItems || isSending)
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-80' 
                    : 'bg-gold-400 hover:bg-gold-300 text-rich-black shadow-gold-400/20 hover:shadow-gold-400/40'}
                `}
              >
                <MessageSquare size={20} />
                {isSending ? 'Sending...' : (hasUnavailableItems ? 'Remove Out of Stock Items' : 'Message Seller')}
              </button>

              {hasUnavailableItems && (
                <div className="flex items-center gap-2 text-red-400 text-xs mt-4 bg-red-400/10 p-3 rounded justify-center">
                  <AlertCircle size={14} />
                  <span>Some items are unavailable</span>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2 text-green-400/80 text-xs mt-6">
                <Check size={14} />
                <span>Direct seller communication</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CartPage;