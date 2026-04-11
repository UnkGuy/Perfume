import { supabase } from './supabase';

export const fetchReviewsAPI = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Check whether the user has bought this product (appears in any of their order_items)
export const checkUserPurchasedAPI = async (userId, productId) => {
  if (!userId || !productId) return false;

  const { data, error } = await supabase
    .from('order_items')
    .select('id, orders!inner(user_id)')
    .eq('product_id', productId)
    .eq('orders.user_id', userId)
    .limit(1);

  if (error) {
    console.error('Purchase check error:', error);
    return false; // fail open — don't block the review button on a query error
  }
  return data && data.length > 0;
};

export const submitReviewAPI = async (productId, userId, rating, comment) => {
  // Validate rating range (mirrors DB integer column)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5.');
  }
  // Guard comment length (reviews.comment is text — set a sensible UI cap)
  if (comment && comment.length > 1000) {
    throw new Error('Review comment is too long (max 1000 characters).');
  }

  const { error } = await supabase
    .from('reviews')
    .insert([{
      product_id: productId,
      user_id: userId,
      rating,
      comment: comment?.trim() || null,
    }]);

  if (error) throw error;
};