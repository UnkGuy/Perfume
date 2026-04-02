import { supabase } from './supabase';


export const fetchUserBanStatusAPI = async (userId) => {

  if (!userId) return false;

  const { data, error } = await supabase.from('profiles').select('is_banned').eq('id', userId).maybeSingle();

  if (error) throw error;

  return data?.is_banned || false;

};


export const toggleUserBanAPI = async (userId, isBanned) => {

  const { data, error } = await supabase

    .from('profiles')

    .update({ is_banned: isBanned })

    .eq('id', userId)

    .select();


  if (error) throw error;


  if (data && data.length === 0) {

    const { error: insertError } = await supabase

      .from('profiles')

      .insert([{ id: userId, is_banned: isBanned }]);

    

    if (insertError) throw insertError;

  }

};


export const fetchUserProfileAPI = async (userId) => {

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (error) throw error;

  return data;

};


export const updateUserProfileAPI = async (userId, updates) => {

  // ✨ CHANGED to .upsert() so it guarantees saving! ✨

  const { error } = await supabase.from('profiles').upsert({ id: userId, ...updates });

  if (error) throw error;

};