import { supabase } from './supabase';

export const fetchActiveChatsAPI = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select(`*, profiles(username, email)`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchMessagesByUserAPI = async (userId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const sendMessageAPI = async (payload) => {
  const { error } = await supabase.from('messages').insert([payload]);
  if (error) throw error;
};