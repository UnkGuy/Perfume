import { supabase } from './supabase';

export const fetchUserBanStatusAPI = async (userId) => {
  if (!userId) return false;
  // Use maybeSingle() instead of single() so it doesn't throw an error if the profile is missing!
  const { data, error } = await supabase.from('profiles').select('is_banned').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data?.is_banned || false;
};

export const toggleUserBanAPI = async (userId, isBanned) => {
  // 1. Try to update the existing profile and SELECT the result
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_banned: isBanned })
    .eq('id', userId)
    .select();

  if (error) throw error;

  // 2. SILENT FAILURE CATCH: If data is empty, the profile row doesn't exist yet!
  if (data && data.length === 0) {
    // Create the profile row with the banned status applied
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{ id: userId, is_banned: isBanned }]);
    
    if (insertError) throw insertError;
  }
};