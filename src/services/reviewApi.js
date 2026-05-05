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
  
  return data;
};

export const updateReviewStatusAPI = async (reviewId, status) => {
  const { data, error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', reviewId)
    .select('product_id')
    .single();

  if (error) throw error;
  if (!data) throw new Error('Action blocked: You do not have permission to update this review.');

  const { data: approvedReviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', data.product_id)
    .eq('status', 'approved');

  let newRating = 0;
  if (approvedReviews && approvedReviews.length > 0) {
    const sum = approvedReviews.reduce((acc, curr) => acc + curr.rating, 0);
    // ✨ STRICT TENTHS: Mathematically forces exactly 1 decimal place 
    newRating = Math.round((sum / approvedReviews.length) * 10) / 10;
  }

  await supabase
    .from('products')
    .update({ rating: newRating })
    .eq('id', data.product_id);

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
    .select(); 

  if (error) {
    console.error('🔥 Submit Review Error:', error.message, error.details);
    throw error;
  }
  
  return data;
};