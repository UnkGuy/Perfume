import { supabase } from './supabase';

export const validatePromoCodeAPI = async (code) => {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !data) throw new Error("Invalid promo code.");
  if (!data.active) throw new Error("This promo code is no longer active.");
  
  if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
    throw new Error("This promo code has expired.");
  }
  if (data.usage_limit && data.times_used >= data.usage_limit) {
    throw new Error("This promo code has reached its usage limit.");
  }
  return data;
};

// ✨ NEW: Admin Functions ✨
export const fetchAllPromosAPI = async () => {
  const { data, error } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createPromoAPI = async (payload) => {
  const { error } = await supabase.from('promo_codes').insert([payload]);
  if (error) throw error;
};

export const deletePromoAPI = async (id) => {
  const { error } = await supabase.from('promo_codes').delete().eq('id', id);
  if (error) throw error;
};