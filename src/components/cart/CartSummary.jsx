import React, { useState } from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase'; 

const CartSummary = ({ localItems, calculateTotal, hasUnavailableItems, user, showToast, setCurrentPage, onCheckoutSuccess }) => {
  const [isSending, setIsSending] = useState(false);
  
  // New State for Delivery Preferences
  const [checkoutInfo, setCheckoutInfo] = useState({
    fulfillmentMethod: 'Delivery', // 'Delivery' | 'Meetup' | 'Pickup'
    paymentMethod: 'GCash',
    location: '',
    phoneNumber: ''
  });

  const handleCheckoutToChat = async () => {
    if (!user) {
      if(showToast) showToast("Login Required", "Please sign in to message the seller.", "error");
      setCurrentPage('login');
      return;
    }
    
    // Require location unless they are picking it up from your physical store
    if (checkoutInfo.fulfillmentMethod !== 'Pickup' && (!checkoutInfo.location || !checkoutInfo.phoneNumber)) {
       if(showToast) showToast("Missing Info", "Please provide a location and contact number.", "error");
       return;
    }

    setIsSending(true);
    const total = calculateTotal();

    try {
      // 1. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders').insert([{ user_id: user.id, total_amount: total, status: 'pending' }]).select().single();
      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItemsToInsert = localItems.map(item => ({
        order_id: orderData.id, product_id: item.id, quantity: item.quantity, price_at_time: item.price
      }));
      await supabase.from('order_items').insert(orderItemsToInsert);

      // 3. Prepare the Metadata for the ChatWidget UI!
      const chatItems = localItems.map(item => ({
        name: item.name, quantity: item.quantity, price: item.price
      }));
      
      // A fallback text string just in case, but the UI will rely on the metadata
      const formattedContent = `New Inquiry Placed.\nFulfillment: ${checkoutInfo.fulfillmentMethod}\nPayment: ${checkoutInfo.paymentMethod}\nContact: ${checkoutInfo.phoneNumber}\nLocation: ${checkoutInfo.location || 'N/A'}`;

      await supabase.from('messages').insert([{ 
        sender_role: 'user', 
        content: formattedContent,
        user_id: user.id,
        metadata: { 
          type: 'order_inquiry', 
          order_id: orderData.id, 
          total: total,
          items: chatItems, // <--- This is what your ChatWidget needs!
          fulfillment: checkoutInfo.fulfillmentMethod,
          payment: checkoutInfo.paymentMethod,
          contact: checkoutInfo.phoneNumber,
          location: checkoutInfo.location
        }
      }]);

      if(showToast) showToast("Inquiry Sent!", "Check your chat widget for details.");
      if(onCheckoutSuccess) onCheckoutSuccess();
    } catch (err) {
      if(showToast) showToast("Error", "Could not process order.", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full lg:w-96 space-y-4">
      <div className="bg-white/5 border border-gold-400/20 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-4">Acquisition Details</h2>
        
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-400 mb-1">How would you like to get this?</label>
            <select 
              value={checkoutInfo.fulfillmentMethod} 
              onChange={e => setCheckoutInfo({...checkoutInfo, fulfillmentMethod: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none focus:border-gold-400"
            >
              <option>Delivery</option>
              <option>Meetup</option>
              <option>Store Pickup</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Payment Preference</label>
            <select 
              value={checkoutInfo.paymentMethod} 
              onChange={e => setCheckoutInfo({...checkoutInfo, paymentMethod: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none focus:border-gold-400"
            >
              <option>GCash</option>
              <option>Bank Transfer</option>
              <option>Cash on Hand</option>
            </select>
          </div>

          {checkoutInfo.fulfillmentMethod !== 'Pickup' && (
            <div>
              <label className="block text-gray-400 mb-1">
                {checkoutInfo.fulfillmentMethod === 'Meetup' ? 'Meetup Location' : 'Delivery Address'}
              </label>
              <input 
                type="text" 
                placeholder="Enter location details..."
                value={checkoutInfo.location}
                onChange={e => setCheckoutInfo({...checkoutInfo, location: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none focus:border-gold-400"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-400 mb-1">Contact Number</label>
            <input 
              type="text" 
              placeholder="09..."
              value={checkoutInfo.phoneNumber}
              onChange={e => setCheckoutInfo({...checkoutInfo, phoneNumber: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded p-2 text-white outline-none focus:border-gold-400"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-gold-400/20 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex justify-between items-center text-xl font-bold text-white mb-6">
          <span>Total Estimate</span>
          <span>₱{calculateTotal().toLocaleString()}</span>
        </div>
        
        <button 
          onClick={handleCheckoutToChat}
          disabled={hasUnavailableItems || isSending}
          className={`w-full py-4 font-bold rounded flex items-center justify-center gap-2 transition-all shadow-lg ${(hasUnavailableItems || isSending) ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gold-400 hover:bg-gold-300 text-rich-black'}`}
        >
          <MessageSquare size={20} /> {isSending ? 'Processing...' : 'Send Inquiry to Seller'}
        </button>
        {hasUnavailableItems && (
           <p className="text-red-400 text-xs text-center mt-3 flex items-center justify-center gap-1"><AlertCircle size={12}/> Please remove out of stock items.</p>
        )}
      </div>
    </div>
  );
};

export default CartSummary;