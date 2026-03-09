import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Send, ShoppingBag, Loader2 } from 'lucide-react';

const AdminMessages = ({ showToast }) => {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // 1. Fetch unique users who have sent messages (Now with Emails!)
  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true);
      // Change the select statement to this:
      const { data, error } = await supabase
        .from('messages')
        .select(`*, profiles(email)`) 
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Group by unique user_id and attach the email
        const uniqueUsers = Array.from(new Set(data.map(m => m.user_id)))
          .map(id => {
            const latestMsg = data.find(m => m.user_id === id);
            return { 
              id, 
              email: latestMsg.profiles?.email || `Customer ${id.substring(0, 6)}`, // <-- Updated here
              lastActive: latestMsg.created_at 
            };
          });
        setActiveChats(uniqueUsers);
      }
      setIsLoading(false);
    };
    fetchChats();
  }, []);

  // 2. Fetch messages for the selected user
  useEffect(() => {
    if (!selectedUser) return;

    const fetchUserMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', selectedUser)
        .order('created_at', { ascending: true });
      
      if (!error && data) setMessages(data);
    };

    fetchUserMessages();

    // Subscribe to new incoming messages for this specific user
    const subscription = supabase
      .channel(`admin-messages-${selectedUser}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${selectedUser}` }, 
        (payload) => setMessages(current => [...current, payload.new])
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [selectedUser]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Send a reply as the Admin
  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedUser) return;

    const messageText = reply;
    setReply('');

    const { error } = await supabase
      .from('messages')
      .insert([{ 
        sender_role: 'admin', 
        content: messageText,
        user_id: selectedUser
      }]);

    if (error && showToast) showToast('Error', 'Failed to send message', 'error');
  };

  return (
    <div className="h-[600px] bg-white/5 border border-white/10 rounded-xl overflow-hidden flex animate-fade-in">
      
      {/* LEFT: Chat List */}
      <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/40">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-bold text-white tracking-widest uppercase text-sm">Active Inquiries</h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gold-400" /></div>
          ) : activeChats.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No active chats.</div>
          ) : (
            activeChats.map(chat => (
              <button 
                key={chat.id}
                onClick={() => setSelectedUser(chat.id)}
                className={`w-full p-4 flex items-center gap-3 text-left transition-colors border-b border-white/5 ${selectedUser === chat.id ? 'bg-gold-400/10' : 'hover:bg-white/5'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${selectedUser === chat.id ? 'bg-gold-400 text-black' : 'bg-white/10 text-white'}`}>
                  <User size={16} />
                </div>
                <div className="overflow-hidden">
                  <p className={`text-sm truncate ${selectedUser === chat.id ? 'text-gold-400 font-bold' : 'text-gray-300'}`}>
                    {chat.email}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(chat.lastActive).toLocaleDateString()}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Chat Window */}
      <div className="w-2/3 flex flex-col">
        {!selectedUser ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a customer on the left to view messages.
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {messages.map(msg => {
                const isAdmin = msg.sender_role === 'admin';
                const isOrder = msg.metadata?.type === 'order_inquiry';

                return (
                  <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    {isOrder ? (
                      <div className="bg-black/60 border border-gold-400/30 p-4 rounded-xl max-w-[85%] text-sm">
                        <div className="flex items-center gap-2 mb-2 text-gold-400 font-bold border-b border-white/10 pb-2">
                          <ShoppingBag size={16} /> Order Inquiry #{msg.metadata.order_id}
                        </div>
                        {/* ADDED whitespace-pre-wrap HERE */}
                        <p className="text-gray-300 mb-2 whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-gold-400 font-mono">Total: ₱{msg.metadata.total?.toLocaleString()}</p>
                      </div>
                    ) : (
                      // ADDED whitespace-pre-wrap HERE
                      <div className={`p-3 rounded-2xl max-w-[75%] text-sm whitespace-pre-wrap ${isAdmin ? 'bg-gold-400 text-black rounded-tr-sm' : 'bg-white/10 text-white border border-white/10 rounded-tl-sm'}`}>
                        {msg.content}
                      </div>
                    )}
                    <span className="text-[10px] text-gray-500 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleReply} className="p-4 border-t border-white/10 bg-black/40">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a reply to the customer..."
                  className="w-full bg-black/50 border border-white/20 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
                />
                <button 
                  type="submit" disabled={!reply.trim()}
                  className="absolute right-2 p-2 bg-gold-400 text-black rounded-full hover:bg-gold-300 disabled:opacity-50 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;