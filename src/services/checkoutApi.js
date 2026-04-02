import { supabase } from './supabase';

export const processCheckoutAPI = async (userId, total, localItems, checkoutInfo, promoCode = null) => {
  // --- ANTI-SPAM CHECK ---
  const { data: recentOrder } = await supabase
    .from('orders')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (recentOrder) {
    const lastOrderTime = new Date(recentOrder.created_at).getTime();
    const currentTime = new Date().getTime();
    if (currentTime - lastOrderTime < 60000) {
      throw new Error("Please wait a minute before placing another inquiry.");
    }
  }

  // --- ✨ PROMO CODE VERIFICATION & INCREMENT ✨ ---
  if (promoCode) {
    // 1. Re-Verify the promo code is still valid at the exact moment of checkout
    const { data: promoData, error: promoErr } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode)
      .single();

    if (promoErr || !promoData || !promoData.active) {
      throw new Error("This promo code is no longer active.");
    }
    if (promoData.usage_limit && promoData.times_used >= promoData.usage_limit) {
      throw new Error("This promo code has reached its global usage limit.");
    }
    if (promoData.expiry_date && new Date(promoData.expiry_date) < new Date()) {
      throw new Error("This promo code has expired.");
    }

    // 2. Check if THIS user has already used this code
    // We check their past messages metadata for the specific promo code
    const { data: pastUsage } = await supabase
      .from('messages')
      .select('id')
      .eq('user_id', userId)
      .eq('metadata->>promo_code', promoCode)
      .limit(1);

    if (pastUsage && pastUsage.length > 0) {
      throw new Error("You have already used this promo code.");
    }

    // 3. Increment the global usage counter!
    const { error: updateErr } = await supabase
      .from('promo_codes')
      .update({ times_used: promoData.times_used + 1 })
      .eq('id', promoData.id);

    if (updateErr) throw new Error("Failed to secure promo code.");
  }

  // --- CREATE ORDER ---
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([{ user_id: userId, total_amount: total, status: 'pending' }])
    .select()
    .single();
    
  if (orderError) throw orderError;

  // --- INSERT ITEMS ---
  const orderItemsToInsert = localItems.map(item => ({
    order_id: orderData.id, 
    product_id: item.id, 
    quantity: item.quantity, 
    price_at_time: item.price
  }));
  
  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
  if (itemsError) throw itemsError;

  // --- SEND RECEIPT MESSAGE ---
  const chatItems = localItems.map(item => ({
    name: item.name, quantity: item.quantity, price: item.price
  }));
  
  let formattedContent = `New Inquiry Placed.\nFulfillment: ${checkoutInfo.fulfillmentMethod}\nPayment: ${checkoutInfo.paymentMethod}\nContact: ${checkoutInfo.phoneNumber}\nLocation: ${checkoutInfo.location || 'N/A'}`;
  if (promoCode) formattedContent += `\nPromo Applied: ${promoCode}`;

  const { error: msgError } = await supabase.from('messages').insert([{ 
    sender_role: 'user', 
    content: formattedContent,
    user_id: userId,
    metadata: { 
      type: 'order_inquiry', 
      order_id: orderData.id, 
      total: total,
      items: chatItems,
      fulfillment: checkoutInfo.fulfillmentMethod,
      payment: checkoutInfo.paymentMethod,
      contact: checkoutInfo.phoneNumber,
      location: checkoutInfo.location,
      promo_code: promoCode // ✨ Log the promo code to prevent reuse!
    }
  }]);

  if (msgError) throw msgError;

  return orderData;
};