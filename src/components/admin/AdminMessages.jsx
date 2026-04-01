import React, { useState, useRef, useEffect } from 'react';
import { User, Send, ShoppingBag, Loader2, Ban, CheckCircle, Search, ArrowLeft, MessageSquare } from 'lucide-react';
import { useActiveChats, useMessageThread } from '../../hooks/useMessages';
import { useUserBan } from '../../hooks/useUserBan'; 

const AdminMessages = ({ showToast }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [reply, setReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const { activeChats, isLoading: chatsLoading } = useActiveChats();
  const { messages, sendMessage } = useMessageThread(selectedUser, 'admin');
  const { isBanned, toggleBan } = useUserBan(selectedUser, showToast); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReply = async (e) => {
    e.preventDefault();
    const { success } = await sendMessage(reply);
    if (success) {
      setReply('');
    } else if (showToast) {
      showToast('Error', 'Failed to send message', 'error');
    }
  };

  const selectedChatData = activeChats.find(c => c.id === selectedUser);
  
  const filteredChats = activeChats.filter(chat => 
    chat.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[600px] md:h-[700px] bg-rich-black border border-white/10 rounded-xl overflow-hidden flex animate-fade-in relative shadow-2xl">
      
      {/* LEFT: Chat List */}
      {/* Hide on mobile if a user IS selected, otherwise full width on mobile, 1/3 on desktop */}
      <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-white/10 flex-col bg-black/40`}>
        <div className="p-4 border-b border-white/10 flex flex-col gap-3">
          <h3 className="font-bold text-white tracking-widest uppercase text-sm">Active Inquiries</h3>
          
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chatsLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gold-400" /></div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No active chats found.</div>
          ) : (
            filteredChats.map(chat => (
              <button 
                key={chat.id}
                onClick={() => setSelectedUser(chat.id)}
                className={`w-full p-4 flex items-center gap-3 text-left transition-colors border-b border-white/5 ${selectedUser === chat.id ? 'bg-gold-400/10' : 'hover:bg-white/5'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${selectedUser === chat.id ? 'bg-gold-400 text-black' : 'bg-white/10 text-white'}`}>
                  <User size={16} />
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className={`text-sm truncate pr-2 ${selectedUser === chat.id ? 'text-gold-400 font-bold' : 'text-gray-300'}`}>
                      {chat.email}
                    </p>
                    <p className="text-[10px] text-gray-500 flex-shrink-0">
                      {new Date(chat.lastActive).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 truncate">Tap to view messages...</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Chat Window */}
      {/* Hide on mobile if NO user is selected, otherwise full width on mobile, 2/3 on desktop */}
      <div className={`${!selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-2/3 flex-col relative`}>
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-white/5">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Select a customer on the left to view messages.</p>
          </div>
        ) : (
          <>
            <div className="p-3 md:p-4 border-b border-white/10 bg-black/20 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
              <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                {/* Mobile Back Button */}
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden p-1.5 -ml-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-white text-sm md:text-base truncate">{selectedChatData?.email}</span>
                  {isBanned && <span className="text-[10px] text-red-400 font-bold tracking-widest">RESTRICTED USER</span>}
                </div>
              </div>
              
              <button 
                onClick={() => toggleBan(!isBanned)}
                className={`flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded text-[10px] md:text-xs font-bold transition-colors flex-shrink-0 ${
                  isBanned 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white'
                }`}
              >
                {isBanned ? <><CheckCircle size={14} className="hidden sm:block"/> Unblock</> : <><Ban size={14} className="hidden sm:block"/> Block</>}
              </button>
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar bg-black/10">
              {messages.map((msg, index) => {
                const isAdmin = msg.sender_role === 'admin';
                const isOrder = msg.metadata?.type === 'order_inquiry';

                let showTimestampDivider = false;
                let timeString = '';

                if (index === 0) {
                  showTimestampDivider = true;
                } else {
                  const prevTime = new Date(messages[index - 1].created_at).getTime();
                  const currTime = new Date(msg.created_at).getTime();
                  if (currTime - prevTime > 1800000) showTimestampDivider = true; 
                }

                if (showTimestampDivider) {
                  timeString = new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                }

                return (
                  <React.Fragment key={msg.id}>
                    {showTimestampDivider && (
                      <div className="w-full text-center my-4 md:my-6 animate-fade-in">
                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-white/5 px-3 py-1 rounded-full">
                          {timeString}
                        </span>
                      </div>
                    )}

                    <div className={`flex flex-col mb-4 ${isAdmin ? 'items-end' : 'items-start'}`}>
                      {isOrder ? (
                        <div className="bg-black/60 border border-gold-400/30 p-3 md:p-4 rounded-xl w-full max-w-[95%] md:max-w-[90%] text-sm shadow-lg">
                          <div className="flex flex-wrap items-center gap-2 mb-3 text-gold-400 font-bold border-b border-white/10 pb-2">
                            <ShoppingBag size={16} /> Order #{msg.metadata.order_id}
                          </div>
                          <div className="space-y-1 mb-3 bg-white/5 p-2 md:p-3 rounded text-xs md:text-sm">
                            {msg.metadata.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between gap-4">
                                <span className="text-gray-300 truncate">{item.quantity}x {item.name}</span>
                                <span className="text-gray-400 flex-shrink-0">₱{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] md:text-xs text-gray-400 mb-3">
                            <div className="truncate"><span className="text-gray-500">Method:</span> {msg.metadata.fulfillment}</div>
                            <div className="truncate"><span className="text-gray-500">Payment:</span> {msg.metadata.payment}</div>
                            <div className="truncate"><span className="text-gray-500">Contact:</span> {msg.metadata.contact}</div>
                            <div className="sm:col-span-2 truncate"><span className="text-gray-500">Location:</span> {msg.metadata.location || 'N/A'}</div>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-white/10">
                            <span className="text-gold-400 font-bold text-xs md:text-sm">Total</span>
                            <span className="text-gold-400 font-bold text-base md:text-lg">₱{msg.metadata.total?.toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-2.5 md:p-3 rounded-2xl max-w-[85%] md:max-w-[75%] text-xs md:text-sm whitespace-pre-wrap ${isAdmin ? 'bg-gold-400 text-black rounded-tr-sm' : 'bg-white/10 text-white border border-white/10 rounded-tl-sm'}`}>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleReply} className="p-3 md:p-4 border-t border-white/10 bg-black/40">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type a reply..."
                  className="w-full bg-black/50 border border-white/20 rounded-full py-2.5 md:py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
                />
                <button 
                  type="submit" disabled={!reply.trim()}
                  className="absolute right-1.5 md:right-2 p-1.5 md:p-2 bg-gold-400 text-black rounded-full hover:bg-gold-300 disabled:opacity-50 transition-all"
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