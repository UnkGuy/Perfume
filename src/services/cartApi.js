import { supabase } from './supabase';

export const fetchUserCartAPI = async (userId) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      quantity,
      product_id,
      products (*)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error("Supabase Cart Fetch Error:", error);
    throw error;
  }

  console.log("Raw DB Cart Data on Load:", data);

  // Flatten data safely
  const formattedCart = data.map(item => {
    // Sometimes Supabase returns joined data as an array, sometimes as an object. This handles both!
    const productData = Array.isArray(item.products) ? item.products[0] : item.products;
    
    if (!productData) {
      console.warn(`Missing product data for cart item with product_id: ${item.product_id}`);
      return null;
    }

    return {
      ...productData,
      quantity: item.quantity
    };
  }).filter(item => item !== null); // Remove any broken items

  console.log("Formatted Cart for React:", formattedCart);
  
  return formattedCart;
};

// Inside src/services/cartApi.js
export const syncCartItemAPI = async (userId, productId, quantity) => {
  // 1. Check if the item is already in the database cart
  const { data: existing, error: fetchErr } = await supabase
    .from('cart_items')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();

  if (fetchErr) throw fetchErr;

  // 2. If it exists, update the quantity. If not, insert a new row.
  if (existing) {
    const { error: updateErr } = await supabase
      .from('cart_items')
      .update({ quantity: quantity })
      .eq('id', existing.id);
    if (updateErr) throw updateErr;
  } else {
    const { error: insertErr } = await supabase
      .from('cart_items')
      .insert([{ user_id: userId, product_id: productId, quantity: quantity }]);
    if (insertErr) throw insertErr;
  }
};
export const removeFromCartAPI = async (userId, productId) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
};

export const clearCartAPI = async (userId) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
};