import { useState } from 'react';
import { processCheckoutAPI } from '../services/checkoutApi';
import { fetchUserBanStatusAPI } from '../services/userApi'; // <-- 1. IMPORT THIS

export const useCheckout = (showToast, setCurrentPage) => {
  const [isSending, setIsSending] = useState(false);

  const submitCheckout = async (user, total, localItems, checkoutInfo, onSuccess) => {
    if (!user) {
      if(showToast) showToast("Login Required", "Please sign in to message the seller.", "error");
      setCurrentPage('login');
      return false;
    }

    // <-- 2. ADD THIS BAN CHECK -->
    const isBanned = await fetchUserBanStatusAPI(user.id);
    if (isBanned) {
      if(showToast) showToast("Restricted", "Your account is not permitted to place inquiries.", "error");
      return false;
    }
    // <-------------------------->
    
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