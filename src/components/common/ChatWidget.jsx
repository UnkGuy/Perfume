import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, ShoppingBag } from 'lucide-react';
import { supabase } from '../../services/supabase';

const ChatWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // --- FETCH & SUBSCRIBE ---
  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id) 
        .order('created_at', { ascending: true });
      
      if (!error && data) setMessages(data);
    };

    fetchMessages();

    const subscription = supabase
      .channel(`public:messages:user_id=eq.${user.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `user_id=eq.${user.id}` 
      }, 
        (payload) => setMessages((current) => [...current, payload.new])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  // --- AUTO-SCROLL ---
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // --- SEND MESSAGE ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage;
    setNewMessage(''); 

    const { error } = await supabase
      .from('messages')
      .insert([{ 
        sender_role: 'user', 
        content: messageText,
        user_id: user.id 
      }]);

    if (error) console.error('Error sending message:', error);
  };

  // --- GUEST BLOCKER ---
  // If there is no user logged in, render absolutely nothing!
  if (!user) return null; 

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[40] p-4 bg-gold-400 text-rich-black rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 hover:bg-gold-300 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={28} />
      </button>

      <div className={`fixed bottom-6 right-6 z-[100] w-[350px] sm:w-[400px] h-[600px] max-h-[80vh] bg-rich-black border border-gold-400/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'}`}>
        
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center border border-gold-400/30">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm tracking-wide">KL Scents Support</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-2">
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-black/40">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-start animate-fade-in">
              <div className="p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed bg-white/10 text-white border border-white/5 rounded-tl-sm">
                Hello! Welcome to KL Scents. How can I help you with your order today? 👋
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.sender_role === 'user';
            const isOrderInquiry = msg.metadata && msg.metadata.type === 'order_inquiry';
            
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}>
                {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-gold-400/20 flex items-center justify-center mb-1 border border-gold-400/30">
                    <User size={12} className="text-gold-400" />
                  </div>
                )}

                {isOrderInquiry ? (
                  <div className="bg-white/5 border border-gold-400/30 p-4 rounded-2xl rounded-tr-sm w-full max-w-[90%] text-white text-sm shadow-lg shadow-gold-400/5">
                    <div className="flex items-center gap-2 mb-3 text-gold-400 font-bold border-b border-white/10 pb-2">
                      <ShoppingBag size={16} />
                      <span>Order Inquiry #{msg.metadata.order_id}</span>
                    </div>
                    
                    {/* Items List */}
                    <div className="space-y-1 mb-3 bg-black/40 p-2 rounded">
                      {msg.metadata.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between gap-4">
                          <span className="text-gray-300">{item.quantity}x {item.name}</span>
                          <span className="text-gray-400">₱{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Customer Info Card */}
                    <div className="grid grid-cols-1 gap-1 text-xs text-gray-400 mb-3 border-b border-white/10 pb-3">
                      <div><span className="text-gray-500 font-medium">Method:</span> {msg.metadata.fulfillment}</div>
                      <div><span className="text-gray-500 font-medium">Payment:</span> {msg.metadata.payment}</div>
                      <div><span className="text-gray-500 font-medium">Contact:</span> {msg.metadata.contact}</div>
                      {msg.metadata.location && (
                        <div><span className="text-gray-500 font-medium">Location:</span> {msg.metadata.location}</div>
                      )}
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-1 font-bold">
                      <span className="text-gold-400">Total Estimate</span>
                      <span className="text-gold-400 text-base">₱{msg.metadata.total?.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'bg-gold-400 text-rich-black rounded-tr-sm font-medium' : 'bg-white/10 text-white border border-white/5 rounded-tl-sm'}`}>
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