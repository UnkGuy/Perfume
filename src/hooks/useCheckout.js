import { useState } from 'react';
import { processCheckoutAPI } from '../services/checkoutApi';
import { fetchUserBanStatusAPI } from '../services/userApi';
import { useShop } from '../contexts/ShopContext';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';

export const useCheckout = () => {
  const { showToast } = useShop();
  const { setCurrentPage } = useUI();
  const { user } = useAuth();
  
  const [isSending, setIsSending] = useState(false);

  const submitCheckout = async (total, localItems, checkoutInfo, onSuccess) => {
    if (!user) {
      if(showToast) showToast("Login Required", "Please sign in to message the seller.", "error");
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
      await processCheckoutAPI(user.id, total, localItems, checkoutInfo);
      if(showToast) showToast("Inquiry Sent!", "Check your chat widget for details.");
      if(onSuccess) onSuccess();
      return true;
    } catch (err) {
      console.error(err);
      if(showToast) showToast("Error", err.message || "Could not process order.", "error");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { submitCheckout, isSending };
};