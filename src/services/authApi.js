import { supabase } from './supabase';

export const loginAPI = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const registerAPI = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const resetPasswordAPI = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

export const fetchUserRoleAPI = async (userId) => {
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
  return data ? data.role : 'customer';
};

export const logoutAPI = async () => {
  await supabase.auth.signOut();
};