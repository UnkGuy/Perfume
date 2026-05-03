import { supabase } from './supabase';

export const fetchUserWishlistAPI = async (userId) => {
  const { data, error } = await supabase
    .from('wishlists')
    // Grab the is_deleted flag so we can filter
    .select('product_id, products(*, product_variants(*))')
    .eq('user_id', userId);
    
  if (error) throw error;
  
  // Map out the products and filter out any that have been soft-deleted
  return data 
    ? data.map(row => row.products).filter(product => product && !product.is_deleted)
    : [];
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