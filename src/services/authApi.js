import { supabase } from './supabase';

export const loginAPI = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

// Update this function!
export const registerAPI = async (email, password, username) => {
  // 1. Create the Auth user
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  // 2. Immediately create their Profile and Assign Role
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: email,
      username: username
    });
    
    await supabase.from('user_roles').upsert({
      user_id: data.user.id,
      role: 'customer'
    });
  }

  return data;
};
// ... rest of the file stays the same

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

export const updatePasswordAPI = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
};

// NEW: OAuth Wrapper
export const signInWithOAuthAPI = async (provider) => {
  const { error } = await supabase.auth.signInWithOAuth({ provider });
  if (error) throw error;
};

// NEW: Context Wrappers
export const getSessionAPI = async () => {
  return await supabase.auth.getSession();
};

export const onAuthStateChangeAPI = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};