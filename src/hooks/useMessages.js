import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase'; // Needed for the realtime channel
import { fetchActiveChatsAPI, fetchMessagesByUserAPI, sendMessageAPI } from '../services/messageApi';

// Hook 1: For the Admin Sidebar
export const useActiveChats = () => {
  const [activeChats, setActiveChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      setIsLoading(true);
      try {
        const data = await fetchActiveChatsAPI();
        if (data) {
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
          uniqueUsers.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
          setActiveChats(uniqueUsers);
        }
      } catch (error) {
        console.error("Failed to load active chats", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadChats();
  }, []);

  return { activeChats, isLoading };
};

// Hook 2: Shared real-time chat logic for both Admin and User
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

    // Subscribe to real-time incoming messages
    const channelName = role === 'admin' ? `admin-messages-${userId}` : `public:messages:user_id=eq.${userId}`;
    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${userId}` }, 
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