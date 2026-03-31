import { supabase } from './supabase';

export const fetchUserWishlistAPI = async (userId) => {
  const { data, error } = await supabase
    .from('wishlists')
    .select('product_id, products(*)')
    .eq('user_id', userId);
    
  if (error) throw error;
  return data ? data.map(row => row.products) : [];
};

export const updateWishlistAPI = async (userId, productId, isAdding) => {
  if (isAdding) {
    const { error } = await supabase.from('wishlists').insert([{ user_id: userId, product_id: productId }]);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('wishlists').delete().match({ user_id: userId, product_id: productId });
    if (error) throw error;
  }
};