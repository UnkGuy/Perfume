import { supabase } from './supabase';

export const fetchReviewsAPI = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(email)')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('🔥 Fetch Approved Reviews Error:', error.message, error.details);
    throw error;
  }
  return data;
};

// Admin specific fetcher for pending reviews
export const fetchPendingReviewsAPI = async () => {
  console.log("🔍 Admin attempting to fetch pending reviews...");
  const { data, error } = await supabase
    .from('reviews')
    .select('*, products(name), profiles(email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('🔥 Fetch Pending Reviews Error:', error.message, error.details);
    throw error;
  }
  
  console.log("✅ Admin fetch successful. Pending reviews found:", data?.length);
  return data;
};

// Admin specific update status function
export const updateReviewStatusAPI = async (reviewId, status) => {
  const { data, error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', reviewId)
    .select();

  if (error) {
    console.error('🔥 Status Update Error:', error.message);
    throw error;
  }
  
  if (!data || data.length === 0) {
    throw new Error('Action blocked: You do not have permission to update this review.');
  }

  return data;
};

export const submitReviewAPI = async (productId, userId, rating, comment, isAnonymous) => {
  console.log("🚀 Attempting to submit review:", { productId, userId, rating, isAnonymous });

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5.');
  }

  let finalComment = comment?.trim() || '';
  if (isAnonymous) finalComment = `[ANON]${finalComment}`;

  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      product_id: productId,
      user_id: userId,
      rating,
      comment: finalComment || null,
      status: 'pending'
    }])
    .select(); // We force .select() here to ensure Supabase hands us back the created row

  if (error) {
    console.error('🔥 Submit Review Error:', error.message, error.details);
    throw error;
  }
  
  console.log("✅ Review successfully inserted into database:", data);
  return data;
};