import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { fetchActiveChatsAPI, fetchMessagesByUserAPI, sendMessageAPI } from '../services/messageApi';

export const useActiveChats = () => {
  const [activeChats, setActiveChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const buildChatList = (data) => {
    if (!data || data.length === 0) return [];
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

    const subscription = supabase.channel('admin-active-chats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        async () => {
          try {
            const data = await fetchActiveChatsAPI();
            if (isMounted) setActiveChats(buildChatList(data));
          } catch (err) {
            console.error("Failed to refresh active chats", err);
          }
        }
      ).subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, []);

  return { activeChats, isLoading };
};

export const useMessageThread = (userId, role) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!userId) { setMessages([]); return; }
    const loadMessages = async () => {
      try {
        const data = await fetchMessagesByUserAPI(userId);
        setMessages(data || []);
      } catch (error) { console.error("Failed to load messages", error); }
    };
    loadMessages();

    const channelName = role === 'admin' ? `admin-messages-${userId}` : `public:messages:user_id=eq.${userId}`;
    const subscription = supabase.channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${userId}` },
        (payload) => setMessages(current => [...current, payload.new])
      ).subscribe();

    return () => supabase.removeChannel(subscription);
  }, [userId, role]);

  const sendMessage = async (content, imageUrl = null) => {
    if ((!content || !content.trim()) && !imageUrl) return { success: false };
    if (!userId) return { success: false };
    try {
      await sendMessageAPI({ 
        sender_role: role, 
        content, 
        user_id: userId,
        metadata: imageUrl ? { image_url: imageUrl } : null 
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // ✨ NEW: Chat Image Uploader
  const uploadChatImage = async (file) => {
    if (!file.type.startsWith('image/')) throw new Error('File must be an image.');
    const fileName = `${userId}_${Date.now()}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('chat-images')
      .upload(fileName, file, { contentType: file.type, upsert: true });

    if (error) throw error;
    const { data: publicUrlData } = supabase.storage.from('chat-images').getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  };

  return { messages, sendMessage, uploadChatImage };
};