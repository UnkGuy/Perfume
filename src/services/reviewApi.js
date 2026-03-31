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

export const submitReviewAPI = async (productId, userId, rating, comment) => {
  const { error } = await supabase
    .from('reviews')
    .insert([{
      product_id: productId,
      user_id: userId,
      rating: rating,
      comment: comment
    }]);

  if (error) throw error;
};