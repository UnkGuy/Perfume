import { supabase } from './supabase';

export const fetchOrdersAPI = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`id, created_at, status, total_amount, user_id, metadata, profiles(email), order_items(quantity, price_at_time, product_id, variant_id, products(name), product_variants(size)), order_status_history(status, created_at)`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const updateOrderStatusAPI = async (orderId, newStatus, orderItems = []) => {
  const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  if (error) throw error;

  // Insert into history tracking table
  await supabase.from('order_status_history').insert([{ order_id: orderId, status: newStatus }]);

  // ✨ OPTIMIZED: Parallel Stock Deductions
  if (newStatus === 'completed' && orderItems.length > 0) {
    const variantIds = orderItems.map(item => item.variant_id).filter(Boolean);
    
    if (variantIds.length > 0) {
      try {
        const { data: variants } = await supabase
          .from('product_variants')
          .select('id, stock_count')
          .in('id', variantIds);

        if (variants) {
          const updatePromises = orderItems.map(item => {
            if (!item.variant_id) return null;
            const variant = variants.find(v => v.id === item.variant_id);
            if (variant?.stock_count != null) {
              const newStock = Math.max(0, variant.stock_count - item.quantity);
              return supabase.from('product_variants').update({ stock_count: newStock }).eq('id', item.variant_id);
            }
            return null;
          }).filter(Boolean); // Remove empty promises

          // Fire all updates simultaneously
          if (updatePromises.length > 0) {
            await Promise.all(updatePromises);
          }
        }
      } catch (err) {
        console.error(`Stock bulk update failed`, err);
      }
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
    .select(`id, created_at, status, total_amount, metadata, order_items(quantity, price_at_time, variant_id, products(*), product_variants(*)), order_status_history(status, created_at)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};