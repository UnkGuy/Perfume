import { supabase } from './supabase';

export const fetchActiveChatsAPI = async () => {
  const { data, error } = await supabase
    .from('latest_messages_per_user') 
    .select('*')
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
  // Relax the text requirement IF an image is attached
  const hasImage = payload.metadata?.image_url;
  const hasText = payload.content && payload.content.trim();

  if (!hasText && !hasImage) throw new Error('Message cannot be empty.');
  if (hasText && payload.content.length > 2000) throw new Error('Message is too long (max 2000 characters).');

  const { error } = await supabase.from('messages').insert([{
    ...payload,
    content: payload.content ? payload.content.trim() : null,
  }]);
  if (error) throw error;
};