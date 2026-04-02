import { useState } from 'react';
import { processCheckoutAPI } from '../services/checkoutApi';
import { fetchUserBanStatusAPI } from '../services/userApi';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { useUI } from '../contexts/UIContext';

export const useCheckout = () => {
  const { user } = useAuth();
  const { showToast } = useShop();
  const { setCurrentPage } = useUI();
  
  const [isSending, setIsSending] = useState(false);

  // ✨ Added promoCode parameter ✨
  const submitCheckout = async (total, localItems, checkoutInfo, promoCode, onSuccess) => {
    if (!user) {
      if(showToast) showToast("Login Required", "Please sign in to place an inquiry.", "error");
      setCurrentPage('login');
      return false;
    }

    const isBanned = await fetchUserBanStatusAPI(user.id);
    if (isBanned) {
      if(showToast) showToast("Restricted", "Your account is not permitted to place inquiries.", "error");
      return false;
    }
    
    if (checkoutInfo.fulfillmentMethod !== 'Store Pickup' && (!checkoutInfo.location || !checkoutInfo.phoneNumber)) {
       if(showToast) showToast("Missing Info", "Please provide a location and contact number.", "error");
       return false;
    }

    setIsSending(true);
    try {
      // ✨ Pass promoCode to API ✨
      await processCheckoutAPI(user.id, total, localItems, checkoutInfo, promoCode);
      if(showToast) showToast("Inquiry Sent!", "Check your chat widget for details.");
      if(onSuccess) onSuccess();
      return true;
    } catch (err) {
      console.error(err);
      if(showToast) showToast("Checkout Error", err.message || "Could not process order.", "error");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { submitCheckout, isSending };
};