import { supabase } from './supabase';

export const fetchReviewsAPI = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'approved') // Only fetch approved reviews for the frontend
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Admin specific fetcher for pending reviews
export const fetchPendingReviewsAPI = async () => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, products(name)') // Join product name to easily identify what is being reviewed
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Admin specific update status function
// Admin specific update status function
export const updateReviewStatusAPI = async (reviewId, status) => {
  const { data, error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', reviewId)
    .select(); // Force Supabase to return the updated row

  if (error) throw error;
  
  // If RLS blocks the update, no error is thrown but data will be empty
  if (!data || data.length === 0) {
    throw new Error('Action blocked: You do not have permission to update this review.');
  }

  return data;
};

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
    return false; 
  }
  return data && data.length > 0;
};

export const submitReviewAPI = async (productId, userId, rating, comment) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5.');
  }
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
      status: 'pending' // Force new reviews to pending
    }]);

  if (error) throw error;
};