import React, { useState } from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { useCheckout } from '../../hooks/useCheckout'; // <-- NEW HOOK IMPORT

const CartSummary = ({ localItems, calculateTotal, hasUnavailableItems, user, showToast, setCurrentPage, onCheckoutSuccess }) => {
  // 1. Pull in the logic from our custom hook
  const { submitCheckout, isSending } = useCheckout(showToast, setCurrentPage);
  
  // 2. Keep the local form state exactly where it belongs: in the UI component
  const [checkoutInfo, setCheckoutInfo] = useState({
    fulfillmentMethod: 'Delivery',
    paymentMethod: 'GCash',
    location: '',
    phoneNumber: ''
  });

  const handleCheckoutToChat = async () => {
    const total = calculateTotal();
    // 3. Call the hook function and pass it the data!
    await submitCheckout(user, total, localItems, checkoutInfo, onCheckoutSuccess);
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

          {checkoutInfo.fulfillmentMethod !== 'Store Pickup' && (
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