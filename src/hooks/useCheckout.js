import { useState } from 'react';
import { processCheckoutAPI } from '../services/checkoutApi';

export const useCheckout = (showToast, setCurrentPage) => {
  const [isSending, setIsSending] = useState(false);

  const submitCheckout = async (user, total, localItems, checkoutInfo, onSuccess) => {
    // 1. Validation Checks
    if (!user) {
      if(showToast) showToast("Login Required", "Please sign in to message the seller.", "error");
      setCurrentPage('login');
      return false;
    }
    
    if (checkoutInfo.fulfillmentMethod !== 'Store Pickup' && (!checkoutInfo.location || !checkoutInfo.phoneNumber)) {
       if(showToast) showToast("Missing Info", "Please provide a location and contact number.", "error");
       return false;
    }

    // 2. Execute API Call
    setIsSending(true);
    try {
      await processCheckoutAPI(user.id, total, localItems, checkoutInfo);
      if(showToast) showToast("Inquiry Sent!", "Check your chat widget for details.");
      if(onSuccess) onSuccess();
      return true;
    } catch (err) {
      console.error(err);
      if(showToast) showToast("Error", "Could not process order.", "error");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { submitCheckout, isSending };
};