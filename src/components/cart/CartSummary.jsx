import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, Tag, MessageSquare } from 'lucide-react';
import { useCheckout } from '../../hooks/useCheckout';
import { validatePromoCodeAPI } from '../../services/promoApi'; 
import { fetchUserProfileAPI } from '../../services/userApi';
import { useShop } from '../../contexts/ShopContext';
import { useAuth } from '../../contexts/AuthContext';

const CartSummary = ({ localItems, calculateTotal, hasUnavailableItems, onCheckoutSuccess }) => {
  const { showToast, clearCart } = useShop();
  const { user } = useAuth(); 
  const { submitCheckout, isSending } = useCheckout();
  
  const [checkoutInfo, setCheckoutInfo] = useState({ 
    fulfillmentMethod: 'Delivery', 
    paymentMethod: 'GCash', 
    phoneNumber: '', 
    location: '' 
  });
  
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); 
  const [promoLoading, setPromoLoading] = useState(false);

  useEffect(() => {
    const loadUserDefaults = async () => {
      if (!user) return;
      try {
        const data = await fetchUserProfileAPI(user.id);
        if (data) {
          let formattedLocation = '';
          if (data.address) {
            try {
              const parsedAddress = JSON.parse(data.address);
              formattedLocation = [
                parsedAddress.street, 
                parsedAddress.barangay, 
                parsedAddress.city, 
                parsedAddress.province
              ].filter(Boolean).join(', ');
              if (parsedAddress.landmark) {
                formattedLocation += ` (Landmark: ${parsedAddress.landmark})`;
              }
            } catch (e) {
              formattedLocation = data.address;
            }
          }
          setCheckoutInfo(prev => ({
            ...prev,
            phoneNumber: data.phone_number || prev.phoneNumber,
            location: formattedLocation || prev.location
          }));
        }
      } catch (err) {
        console.error("Failed to load user defaults for cart:", err);
      }
    };
    loadUserDefaults();
  }, [user]);

  const subtotal = calculateTotal();
  const discountAmount = appliedPromo ? subtotal * (appliedPromo.discount_percentage / 100) : 0;
  const finalTotal = subtotal - discountAmount;

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoLoading(true);
    try {
      const promoData = await validatePromoCodeAPI(promoCodeInput);
      setAppliedPromo(promoData);
      setPromoCodeInput('');
      showToast('Promo Applied!', `You got ${promoData.discount_percentage}% off.`);
    } catch (err) {
      showToast('Error', err.message, 'error');
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => setAppliedPromo(null);

  const handleCheckout = async () => {
    const promoCode = appliedPromo ? appliedPromo.code : null;
    const handleSuccess = async () => {
      await clearCart(); 
      if (onCheckoutSuccess) onCheckoutSuccess();
    };
    await submitCheckout(finalTotal, localItems, checkoutInfo, promoCode, handleSuccess);
  };
  
  // ✨ NEW: Edge Case Validation Logic ✨
  const isPhoneValid = /^(09|\+639)\d{9}$/.test(checkoutInfo.phoneNumber.trim());
  const isLocationValid = checkoutInfo.fulfillmentMethod === 'Store Pickup' || 
                         (checkoutInfo.location.trim().length >= 10 && checkoutInfo.location.trim().length <= 250);
  const isFormValid = isPhoneValid && isLocationValid && !hasUnavailableItems;

  return (
    <div className="w-full lg:w-[400px] flex-shrink-0 animate-slide-in">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 sticky top-32 shadow-2xl backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Order Summary</h2>

        {/* Promo Code Section (Unchanged) */}
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

        <div className="space-y-4 mb-6 border-b border-white/10 pb-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fulfillment Method</label>
            <select 
              value={checkoutInfo.fulfillmentMethod} 
              onChange={e => setCheckoutInfo({...checkoutInfo, fulfillmentMethod: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-gold-400"
            >
              <option>Delivery</option>
              <option>Meetup</option>
              <option>Store Pickup</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Preference</label>
            <select 
              value={checkoutInfo.paymentMethod} 
              onChange={e => setCheckoutInfo({...checkoutInfo, paymentMethod: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-gold-400"
            >
              <option>GCash</option>
              <option>Bank Transfer</option>
              <option>Cash on Hand</option>
            </select>
          </div>

          {checkoutInfo.fulfillmentMethod !== 'Store Pickup' && (
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                {checkoutInfo.fulfillmentMethod === 'Meetup' ? 'Meetup Location' : 'Delivery Address'}
              </label>
              {/* ✨ Added limits and validation styles to Address ✨ */}
              <textarea 
                placeholder="House No., Street, City, Province..."
                value={checkoutInfo.location}
                onChange={e => setCheckoutInfo({...checkoutInfo, location: e.target.value})}
                maxLength={250}
                className={`w-full bg-black/40 border rounded-lg px-4 py-2 text-sm text-white focus:outline-none transition-colors resize-none h-20 
                  ${checkoutInfo.location && !isLocationValid ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-gold-400'}`}
              />
              {checkoutInfo.location && !isLocationValid && (
                <p className="text-red-400 text-xs mt-1">Please provide a complete address (min 10 chars).</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contact Number</label>
            {/* ✨ Actively block letters with RegEx and limit length ✨ */}
            <input 
              type="tel" 
              placeholder="09123456789"
              value={checkoutInfo.phoneNumber}
              onChange={e => {
                // Only allow numbers and the plus sign
                const sanitized = e.target.value.replace(/[^\d+]/g, '');
                setCheckoutInfo({...checkoutInfo, phoneNumber: sanitized});
              }}
              maxLength={13}
              className={`w-full bg-black/40 border rounded-lg px-4 py-2 text-sm text-white focus:outline-none transition-colors 
                ${checkoutInfo.phoneNumber && !isPhoneValid ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-gold-400'}`}
            />
            {checkoutInfo.phoneNumber && !isPhoneValid && (
               <p className="text-red-400 text-xs mt-1">Must be a valid PH number (e.g. 09... or +639...).</p>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-6 border-b border-white/10 pb-6">
          <div className="flex justify-between text-gray-400 text-sm">
            <span>Subtotal ({localItems.length} items)</span>
            <span>₱{subtotal.toLocaleString()}</span>
          </div>
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

        {/* ✨ Disable button if form is invalid ✨ */}
        <button 
          onClick={handleCheckout}
          disabled={!isFormValid || isSending}
          className="w-full py-4 bg-gold-400 hover:bg-gold-300 text-black font-bold uppercase tracking-widest rounded transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <><Loader2 className="animate-spin" size={20} /> Sending Inquiry...</>
          ) : (
            <><MessageSquare size={20} /> Request Order</>
          )}
        </button>
      </div>
    </div>
  );
};

export default CartSummary;