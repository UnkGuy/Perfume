import { supabase } from './supabase';

export const processCheckoutAPI = async (userId, total, localItems, checkoutInfo) => {
  // --- ANTI-SPAM CHECK ---
  // Fetch the user's most recent order
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
    const timeDifference = currentTime - lastOrderTime;

    // If less than 60 seconds (60000ms) have passed, block the request
    if (timeDifference < 60000) {
      throw new Error("Please wait a minute before placing another inquiry.");
    }
  }
  // --- END ANTI-SPAM CHECK ---

  // 1. Create the Order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([{ user_id: userId, total_amount: total, status: 'pending' }])
    .select()
    .single();
    
  if (orderError) throw orderError;

  // 2. Insert the Order Items
  const orderItemsToInsert = localItems.map(item => ({
    order_id: orderData.id, 
    product_id: item.id, 
    quantity: item.quantity, 
    price_at_time: item.price
  }));
  
  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
  if (itemsError) throw itemsError;

  // 3. Send the automated chat message
  const chatItems = localItems.map(item => ({
    name: item.name, quantity: item.quantity, price: item.price
  }));
  
  const formattedContent = `New Inquiry Placed.\nFulfillment: ${checkoutInfo.fulfillmentMethod}\nPayment: ${checkoutInfo.paymentMethod}\nContact: ${checkoutInfo.phoneNumber}\nLocation: ${checkoutInfo.location || 'N/A'}`;

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
      location: checkoutInfo.location
    }
  }]);

  if (msgError) throw msgError;

  return orderData;
};