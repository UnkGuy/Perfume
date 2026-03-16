import { supabase } from './supabase';

export const processCheckoutAPI = async (userId, total, localItems, checkoutInfo) => {
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