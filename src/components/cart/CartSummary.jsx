import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, Tag } from 'lucide-react';
import { useCheckout } from '../../hooks/useCheckout';
import { validatePromoCodeAPI } from '../../services/promoApi'; // <-- NEW IMPORT

const CartSummary = ({ localItems, calculateTotal, hasUnavailableItems, user, showToast, setCurrentPage, onCheckoutSuccess }) => {
  const { submitCheckout, isSending } = useCheckout(showToast, setCurrentPage);
  
  // --- STATE ---
  const [checkoutInfo, setCheckoutInfo] = useState({ fulfillmentMethod: 'Delivery', paymentMethod: 'GCash', phoneNumber: '', location: '' });
  
  // --- PROMO CODE STATE ---
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // Will hold { code, discount_percentage }
  const [promoLoading, setPromoLoading] = useState(false);

  // --- MATH ---
  const subtotal = calculateTotal();
  const discountAmount = appliedPromo ? subtotal * (appliedPromo.discount_percentage / 100) : 0;
  const finalTotal = subtotal - discountAmount;

  // --- PROMO LOGIC ---
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoLoading(true);
    try {
      const promoData = await validatePromoCodeAPI(promoCodeInput);
      setAppliedPromo(promoData);
      setPromoCodeInput('');
      if (showToast) showToast('Promo Applied!', `You got ${promoData.discount_percentage}% off.`);
    } catch (err) {
      if (showToast) showToast('Error', err.message, 'error');
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  const handleCheckout = async () => {
    // We pass the final discounted total to the checkout API!
    const success = await submitCheckout(user, finalTotal, localItems, checkoutInfo, onCheckoutSuccess);
    if (success && appliedPromo) {
      // (Optional) We could log the promo usage here later via an API call
      console.log(`Used promo: ${appliedPromo.code}`);
    }
  };

  return (
    <div className="w-full lg:w-[400px] flex-shrink-0 animate-slide-in">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 sticky top-32 shadow-2xl backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Order Summary</h2>

        {/* --- PROMO CODE INPUT --- */}
        <div className="mb-6 border-b border-white/10 pb-6">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Tag size={14} className="text-gold-400" /> Have a Promo Code?
          </label>
          
          {appliedPromo ? (
            <div className="flex justify-between items-center bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
              <div>
                <span className="text-green-400 font-bold uppercase tracking-wider text-sm">{appliedPromo.code}</span>
                <span className="text-gray-400 text-xs ml-2">({appliedPromo.discount_percentage}% OFF)</span>
              </div>
              <button onClick={removePromo} className="text-red-400 text-xs hover:underline font-bold">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter code" 
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-gold-400 uppercase"
              />
              <button 
                onClick={handleApplyPromo}
                disabled={promoLoading || !promoCodeInput}
                className="px-4 py-2 bg-white/5 hover:bg-gold-400/20 text-gold-400 border border-white/10 hover:border-gold-400/30 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
              >
                {promoLoading ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
              </button>
            </div>
          )}
        </div>

        {/* ... Rest of your fulfillment & payment selects go here ... */}
        {/* Keeping this short for brevity, just leave your existing <select> and <input> fields here exactly as they are! */}

        <div className="space-y-4 mb-6 border-b border-white/10 pb-6 pt-2">
          <div className="flex justify-between text-gray-400 text-sm">
            <span>Subtotal ({localItems.length} items)</span>
            <span>₱{subtotal.toLocaleString()}</span>
          </div>
          
          {/* Show Discount Row if applied */}
          {appliedPromo && (
            <div className="flex justify-between text-gold-400 text-sm font-bold">
              <span>Discount ({appliedPromo.discount_percentage}%)</span>
              <span>- ₱{discountAmount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between text-gray-400 text-sm">
            <span>Shipping</span>
            <span>{checkoutInfo.fulfillmentMethod === 'Store Pickup' ? 'Free' : 'Calculated in chat'}</span>
          </div>
        </div>

        <div className="flex justify-between items-end mb-8">
          <span className="text-white font-bold text-lg">Estimated Total</span>
          <span className="text-3xl font-bold text-gold-400">₱{finalTotal.toLocaleString()}</span>
        </div>

        {hasUnavailableItems && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <p>Please remove out of stock items before proceeding.</p>
          </div>
        )}

        <button 
          onClick={handleCheckout}
          disabled={hasUnavailableItems || isSending}
          className="w-full py-4 bg-gold-400 hover:bg-gold-300 text-black font-bold uppercase tracking-widest rounded transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? <><Loader2 className="animate-spin" size={20} /> Sending Inquiry...</> : <><CheckCircle size={20} /> Request Order</>}
        </button>
      </div>
    </div>
  );
};

export default CartSummary;