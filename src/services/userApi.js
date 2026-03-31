import { supabase } from './supabase';

export const fetchUserBanStatusAPI = async (userId) => {
  if (!userId) return false;
  const { data, error } = await supabase.from('profiles').select('is_banned').eq('id', userId).single();
  if (error) throw error;
  return data?.is_banned || false;
};

export const toggleUserBanAPI = async (userId, isBanned) => {
  const { error } = await supabase.from('profiles').update({ is_banned: isBanned }).eq('id', userId);
  if (error) throw error;
};