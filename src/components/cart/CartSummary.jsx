import React, { useState } from 'react';
import { MessageSquare, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Make sure the path matches your structure

const CartSummary = ({ 
  localItems, 
  calculateTotal, 
  hasUnavailableItems, 
  user, 
  showToast, 
  setCurrentPage, 
  onCheckoutSuccess // New prop to tell the parent to clear the cart
}) => {
  const [isSending, setIsSending] = useState(false);

  // --- SEND TO MESSENGER INTEGRATION ---
  const handleCheckoutToChat = async () => {
    // Guest Block
    if (!user) {
      if(showToast) showToast("Login Required", "Please sign in to message the seller.", "error");
      setCurrentPage('login');
      return;
    }

    setIsSending(true);
    const total = calculateTotal();

    try {
      // STEP 1: Create the main Order record
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
      const orderItemsToInsert = localItems.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // STEP 3: Send the Chat Message
      const chatMetadataItems = localItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));
      
      // Formatting the list with bullet points and line breaks
      const itemListString = localItems.map(item => 
        `• ${item.quantity}x ${item.name} (₱${(item.price * item.quantity).toLocaleString()})`
      ).join('\n');

      const formattedContent = `Hi! I would like to inquire about Order #${orderId}:\n\n${itemListString}\n\nEstimated Total: ₱${total.toLocaleString()}`;

      const { error: messageError } = await supabase
        .from('messages')
        .insert([{ 
          sender_role: 'user', 
          content: formattedContent,
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
      
      // Trigger the parent component to clear the cart UI
      if(onCheckoutSuccess) onCheckoutSuccess();

    } catch (err) {
      console.error('Checkout error:', err);
      if(showToast) showToast("Error", "Could not process order. Please try again.", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full lg:w-96">
      <div className="bg-white/5 border border-gold-400/20 rounded-2xl p-8 sticky top-32 backdrop-blur-sm">
        <h2 className="text-xl font-bold mb-2">Ready to Purchase?</h2>
        <p className="text-sm text-gray-400 mb-8 pb-6 border-b border-white/10">
          Message the seller to arrange payment and delivery details.
        </p>
        
        {/* Item List */}
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
        
        {/* Total */}
        <div className="flex justify-between items-center text-xl font-bold text-white pt-6 border-t border-white/10 mb-8">
          <span>Total</span>
          <span>₱{calculateTotal().toLocaleString()}</span>
        </div>
        
        {/* Action Button */}
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

        {/* Warnings */}
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
  );
};

export default CartSummary;