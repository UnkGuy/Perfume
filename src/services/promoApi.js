import { supabase } from './supabase';

export const validatePromoCodeAPI = async (code) => {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error || !data) throw new Error("Invalid promo code.");
  if (!data.active) throw new Error("This promo code is no longer active.");
  
  // Check Expiry
  if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
    throw new Error("This promo code has expired.");
  }

  // Check Limits
  if (data.usage_limit && data.times_used >= data.usage_limit) {
    throw new Error("This promo code has reached its usage limit.");
  }

  return data;
};