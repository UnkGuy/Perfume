import { supabase } from './supabase';

export const fetchOrdersAPI = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`id, created_at, status, total_amount, user_id, metadata, profiles(email), order_items(quantity, price_at_time, product_id, variant_id, products(name), product_variants(size))`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const updateOrderStatusAPI = async (orderId, newStatus, orderItems = []) => {
  const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  if (error) throw error;

  if (newStatus === 'completed' && orderItems.length > 0) {
    for (const item of orderItems) {
      if (!item.variant_id) continue; 
      try {
        const { data: variant } = await supabase.from('product_variants').select('stock_count').eq('id', item.variant_id).single();
        if (variant?.stock_count != null) {
          const newStock = Math.max(0, variant.stock_count - item.quantity);
          await supabase.from('product_variants').update({ stock_count: newStock }).eq('id', item.variant_id);
        }
      } catch (err) { console.error(`Stock update failed`, err); }
    }
  }
};

export const updateOrderDetailsAPI = async (orderId, newTotal, updatedMetadata, newOrderItems = null) => {
  const { data: currentOrder } = await supabase.from('orders').select('metadata').eq('id', orderId).single();
  const currentMeta = currentOrder?.metadata || {};

  const { error: orderError } = await supabase
    .from('orders')
    .update({ 
      total_amount: newTotal,
      metadata: { ...currentMeta, ...updatedMetadata }
    })
    .eq('id', orderId);

  if (orderError) throw orderError;

  // Sync new order items if modified
  if (newOrderItems) {
    // 1. Clear old items
    const { error: deleteError } = await supabase.from('order_items').delete().eq('order_id', orderId);
    if (deleteError) throw deleteError;

    // 2. Insert updated items
    if (newOrderItems.length > 0) {
      const itemsToInsert = newOrderItems.map(item => ({
        order_id: orderId,
        product_id: item.product_id || item.products?.id,
        variant_id: item.variant_id || (Array.isArray(item.product_variants) ? item.product_variants[0]?.id : item.product_variants?.id),
        quantity: item.quantity,
        price_at_time: item.price_at_time
      }));
      
      const { error: insertError } = await supabase.from('order_items').insert(itemsToInsert);
      if (insertError) throw insertError;
    }
  }
};

export const fetchUserOrdersAPI = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`id, created_at, status, total_amount, metadata, order_items(quantity, price_at_time, variant_id, products(*), product_variants(*))`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};