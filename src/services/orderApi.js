import { supabase } from './supabase';

export const fetchOrdersAPI = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, 
      created_at, 
      status, 
      total_amount,
      user_id,
      profiles (email), 
      order_items (
        quantity, 
        price_at_time,
        product_id,
        products (name)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateOrderStatusAPI = async (orderId, newStatus, orderItems = []) => {
  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) throw error;

  // Only decrement stock when an order is marked as completed
  if (newStatus === 'completed' && orderItems.length > 0) {
    for (const item of orderItems) {
      try {
        const { data: product } = await supabase
          .from('products')
          .select('stock_count')
          .eq('id', item.product_id)
          .single();

        if (product?.stock_count != null) {
          const newStock = Math.max(0, product.stock_count - item.quantity);
          await supabase
            .from('products')
            .update({
              stock_count: newStock,
              available: newStock > 0,
            })
            .eq('id', item.product_id);
        }
      } catch (err) {
        console.error(`Stock update failed for product ${item.product_id}:`, err);
      }
    }
  }
};

export const fetchUserOrdersAPI = async (userId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, created_at, status, total_amount,
      order_items (
        quantity, price_at_time,
        products (*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};