import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { fetchActiveChatsAPI, fetchMessagesByUserAPI, sendMessageAPI } from '../services/messageApi';

// ─── Hook 1: Admin sidebar chat list ────────────────────────────────────────
export const useActiveChats = () => {
  const [activeChats, setActiveChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildChatList = (data) => {
    if (!data || data.length === 0) return [];
    const uniqueUsers = Array.from(new Set(data.map(m => m.user_id))).map(id => {
      const userMessages = data.filter(m => m.user_id === id);
      const latestMsg = userMessages[0];
      return {
        id,
        email: latestMsg.profiles?.email || `Customer ${id.substring(0, 6)}`,
        displayName: latestMsg.profiles?.username || latestMsg.profiles?.email,
        lastActive: latestMsg.created_at
      };
    });
    return uniqueUsers.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
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

    // ← was missing: subscribe to new messages so the sidebar updates without a page refresh.
    //   When a first-time customer sends a message the admin sees them immediately.
    const subscription = supabase
      .channel('admin-active-chats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async () => {
          // Re-fetch the full list to get updated profiles join and sort order
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