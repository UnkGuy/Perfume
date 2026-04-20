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

// ✨ NEW: Edit Order Details API (Merges Metadata to prevent data loss!)
export const updateOrderDetailsAPI = async (orderId, newTotal, customFees) => {
  // 1. Fetch current metadata so we don't delete promo codes / addresses
  const { data: currentOrder } = await supabase.from('orders').select('metadata').eq('id', orderId).single();
  const currentMeta = currentOrder?.metadata || {};

  // 2. Perform the update
  const { error } = await supabase
    .from('orders')
    .update({ 
      total_amount: newTotal,
      metadata: { ...currentMeta, custom_fees: customFees }
    })
    .eq('id', orderId);

  if (error) throw error;
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