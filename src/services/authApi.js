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
  
  const { data, error } = await supabase.auth.signUp({ 
    email: cleanEmail, 
    password 
  });
  if (error) throw error;

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
  const cleanEmail = email.trim().toLowerCase();
  
  // Ensure the redirect URL is flawlessly constructed for Supabase PKCE
  const getURL = () => {
    let url = import.meta.env.VITE_SITE_URL ?? window.location.origin;
    return url.endsWith('/') ? url : `${url}/`;
  };

  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: `${getURL()}reset-password`,
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

export const signInWithOAuthAPI = async (provider) => {
  const getURL = () => {
    let url = import.meta.env.VITE_SITE_URL ?? window.location.origin;
    url = url.endsWith('/') ? url : `${url}/`;
    return url;
  };

  const { data, error } = await supabase.auth.signInWithOAuth({ 
    provider,
    options: { redirectTo: getURL() }
  });
  
  if (error) throw error;
  return data;
};

export const linkOAuthIdentityAPI = async (provider) => {
  const getURL = () => {
    let url = import.meta.env.VITE_SITE_URL ?? window.location.origin;
    url = url.endsWith('/') ? url : `${url}/`;
    return url;
  };

  const { data, error } = await supabase.auth.linkIdentity({ 
    provider,
    options: { redirectTo: `${getURL()}profile` }
  });
  if (error) throw error;
  return data;
};

export const unlinkOAuthIdentityAPI = async (identity) => {
  const { error } = await supabase.auth.unlinkIdentity(identity);
  if (error) throw error;
};

export const getUserIdentitiesAPI = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user?.identities || [];
};

export const getSessionAPI = async () => {
  return await supabase.auth.getSession();
};

export const onAuthStateChangeAPI = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};