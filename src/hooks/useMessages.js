import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { fetchActiveChatsAPI, fetchMessagesByUserAPI, sendMessageAPI } from '../services/messageApi';

// ─── Hook 1: Admin sidebar chat list ────────────────────────────────────────
export const useActiveChats = () => {
  const [activeChats, setActiveChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildChatList = (data) => {
    if (!data || data.length === 0) return [];
    
    // The SQL view already grouped these by user! We just map the clean data.
    return data.map(msg => ({
      id: msg.user_id,
      email: msg.email || `Customer ${msg.user_id.substring(0, 6)}`,
      displayName: msg.username || msg.email || 'Unknown User',
      lastActive: msg.created_at
    }));
  };

  useEffect(() => {
    let isMounted = true;

    const loadChats = async () => {
      setIsLoading(true);
      try {
        const data = await fetchActiveChatsAPI();
        if (isMounted) setActiveChats(buildChatList(data));
      } catch (error) {
        console.error("Failed to load active chats", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadChats();

    const subscription = supabase
      .channel('admin-active-chats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async () => {
          try {
            const data = await fetchActiveChatsAPI();
            if (isMounted) setActiveChats(buildChatList(data));
          } catch (err) {
            console.error("Failed to refresh active chats", err);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, []);

  return { activeChats, isLoading };
};

// ─── Hook 2: Shared realtime thread for admin and customer ───────────────────
export const useMessageThread = (userId, role) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const data = await fetchMessagesByUserAPI(userId);
        setMessages(data || []);
      } catch (error) {
        console.error("Failed to load messages", error);
      }
    };

    loadMessages();

    const channelName = role === 'admin'
      ? `admin-messages-${userId}`
      : `public:messages:user_id=eq.${userId}`;

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${userId}` },
        (payload) => setMessages(current => [...current, payload.new])
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [userId, role]);

  const sendMessage = async (content) => {
    if (!content.trim() || !userId) return { success: false };
    try {
      await sendMessageAPI({ sender_role: role, content, user_id: userId });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { messages, sendMessage };
};