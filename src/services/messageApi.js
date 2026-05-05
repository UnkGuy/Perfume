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
  const hasImage = payload.metadata?.image_url;
  const hasText = payload.content && payload.content.trim();

  if (!hasText && !hasImage) throw new Error('Message cannot be empty.');
  if (hasText && payload.content.length > 2000) throw new Error('Message is too long (max 2000 characters).');

  const { data, error } = await supabase.from('messages').insert([{
    ...payload,
    content: hasText ? payload.content.trim() : '',
  }]).select().single();

  if (error) throw error;
  return data;
};

export const markMessagesAsSeenAPI = async (userId) => {
  const { error } = await supabase
    .from('messages')
    .update({ is_seen: true })
    .eq('user_id', userId)
    .eq('sender_role', 'customer')
    .eq('is_seen', false);
    
  if (error) throw error;
};