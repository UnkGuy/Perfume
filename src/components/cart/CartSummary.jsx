import React from 'react';
import { MessageSquare, AlertCircle, Check } from 'lucide-react';

const CartSummary = ({ localItems, calculateTotal, hasUnavailableItems, isSending, handleCheckoutToChat }) => {
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