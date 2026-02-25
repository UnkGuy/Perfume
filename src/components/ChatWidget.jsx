import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // --- FETCH & SUBSCRIBE TO REALTIME MESSAGES ---
  useEffect(() => {
    // 1. Fetch existing messages on load
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (!error && data) setMessages(data);
    };

    fetchMessages();

    // 2. Subscribe to real-time incoming messages
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
        (payload) => {
          setMessages((current) => [...current, payload.new]);
        }
      )
      .subscribe();

    // Cleanup subscription when component unmounts
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // --- AUTO-SCROLL TO BOTTOM ---
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // --- SEND MESSAGE HANDLER ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage;
    setNewMessage(''); // Clear input immediately for better UX

    // Insert into database as 'user'
    const { error } = await supabase
      .from('messages')
      .insert([{ sender_role: 'user', content: messageText }]);

    if (error) {
      console.error('Error sending message:', error);
      // Optional: Add toast notification here if it fails
    }
  };

  return (
    <>
      {/* --- FLOATING CHAT BUBBLE TRIGGER --- */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[90] p-4 bg-gold-400 text-rich-black rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 hover:bg-gold-300 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={28} />
      </button>

      {/* --- CHAT WINDOW --- */}
      <div 
        className={`fixed bottom-6 right-6 z-[100] w-[350px] sm:w-[400px] h-[600px] max-h-[80vh] bg-rich-black border border-gold-400/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'}`}
      >
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center border border-gold-400/30">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm tracking-wide">KL Scents Seller</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-black/40">
          
          {/* STATIC EXAMPLE: The Styled Order Bubble you created */}
          <div className="flex flex-col items-end animate-fade-in">
            <div className="bg-white/5 border border-gold-400/30 p-4 rounded-2xl rounded-tr-sm max-w-[85%] text-white text-sm">
              <div className="flex items-center gap-2 mb-3 text-gold-400 font-bold border-b border-white/10 pb-2">
                <ShoppingBag size={16} />
                <span>Order Inquiry</span>
              </div>
              <p className="mb-3 text-gray-300">Hi! I would like to inquire about this order:</p>
              <div className="space-y-1 mb-3">
                <div className="flex justify-between gap-4"><span className="text-gray-400">2x Luxury Parfum 1</span><span>₱198</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-400">1x Luxury Parfum 4</span><span>₱129</span></div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold">
                <span className="text-gold-400">Estimate</span>
                <span>₱327</span>
              </div>
            </div>
            <span className="text-[10px] text-gray-500 mt-1">Prototype Example</span>
          </div>

          {/* DYNAMIC MESSAGES FROM DATABASE */}
          {messages.map((msg) => {
            const isUser = msg.sender_role === 'user';
            
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}>
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-gold-400/20 flex items-center justify-center mb-1 border border-gold-400/30">
                    <User size={12} className="text-gold-400" />
                  </div>
                )}
                <div 
                  className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                    isUser 
                      ? 'bg-gold-400 text-rich-black rounded-tr-sm font-medium' 
                      : 'bg-white/10 text-white border border-white/5 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-500 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          
          {/* Invisible div to scroll to the bottom */}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Area */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-black/50 border border-white/20 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors placeholder-gray-500"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-2 p-2 bg-gold-400 text-black rounded-full hover:bg-gold-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatWidget;