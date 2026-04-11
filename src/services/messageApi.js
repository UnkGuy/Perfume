import { supabase } from './supabase';

// ← was fetching every message in the DB. Now limits to recent 300
// so the admin sidebar doesn't scan the full table on every mount.
// Real fix: CREATE VIEW latest_messages_per_user in Supabase SQL editor:
//   CREATE VIEW latest_messages_per_user AS
//   SELECT DISTINCT ON (user_id) *, profiles.username, profiles.email
//   FROM messages LEFT JOIN profiles ON messages.user_id = profiles.id
//   WHERE user_id IS NOT NULL
//   ORDER BY user_id, created_at DESC;
// Then replace this with: supabase.from('latest_messages_per_user').select('*')
export const fetchActiveChatsAPI = async () => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles(username, email)')
    .not('user_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(300); // cap at 300 instead of unlimited full-table scan

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
  // Guard: message content must not be empty or exceed 2000 chars
  if (!payload.content || !payload.content.trim()) throw new Error('Message cannot be empty.');
  if (payload.content.length > 2000) throw new Error('Message is too long (max 2000 characters).');

  const { error } = await supabase.from('messages').insert([{
    ...payload,
    content: payload.content.trim(),
  }]);
  if (error) throw error;
};