import { supabase } from './supabase';

export const loginAPI = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ 
    email: email.trim().toLowerCase(), 
    password 
  });
  if (error) throw error;
  return data;
};

export const registerAPI = async (email, password, username) => {
  const cleanEmail = email.trim().toLowerCase();
  
  // 1. Create the Auth user
  const { data, error } = await supabase.auth.signUp({ 
    email: cleanEmail, 
    password 
  });
  if (error) throw error;

  // 2. Safely attempt to create Profile and Assign Role
  // Note: If you have strict RLS, this might fail until the user verifies their email.
  // Best practice is to use a Postgres Trigger on auth.users to create profiles automatically.
  if (data?.user?.id) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: cleanEmail,
      username: username.trim()
    });
    
    if (!profileError) {
      await supabase.from('user_roles').upsert({
        user_id: data.user.id,
        role: 'customer'
      });
    } else {
        console.warn("Profile creation deferred until email verification.");
    }
  }

  return data;
};

export const resetPasswordAPI = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/reset-password`, // Ensure this route exists
  });
  if (error) throw error;
};

export const fetchUserRoleAPI = async (userId) => {
  if (!userId) return 'customer';
  const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId).single();
  if (error || !data) return 'customer';
  return data.role;
};

export const logoutAPI = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const updatePasswordAPI = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

// ✨ FIXED: OAuth Wrapper now includes redirectTo
export const signInWithOAuthAPI = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({ 
    provider,
    options: {
      redirectTo: `${window.location.origin}/`, 
    }
  });
  if (error) throw error;
  return data;
};

export const getSessionAPI = async () => {
  return await supabase.auth.getSession();
};

export const onAuthStateChangeAPI = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};