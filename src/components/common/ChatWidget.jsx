import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, ShoppingBag, AlertCircle, ImageIcon, Loader2 } from 'lucide-react';
import { useMessageThread } from '../../hooks/useMessages';
import { useUserBan } from '../../hooks/useUserBan';
import { useAuth } from '../../contexts/AuthContext';

const MAX_CHARS = 250;

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false); 
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null); 
  const fileInputRef = useRef(null); 

  const { messages, sendMessage, uploadChatImage } = useMessageThread(user?.id, 'user');
  const { isBanned } = useUserBan(user?.id);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (isBanned || isUploading) return;
    if (!newMessage.trim() && !isUploading) return;
    
    const { success } = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
      if (textareaRef.current) textareaRef.current.style.height = '44px';
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadChatImage(file);
      await sendMessage(newMessage, url); 
      setNewMessage('');
      if (textareaRef.current) textareaRef.current.style.height = '44px';
    } catch (err) {
      console.error(err);
      alert("Failed to upload image. Please ensure it's a valid JPG/PNG.");
    } finally {
      setIsUploading(false);
      e.target.value = ''; 
    }
  };

  const handleInput = (e) => {
    setNewMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[40] p-4 bg-gold-400 text-rich-black rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 hover:bg-gold-300 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={28} />
      </button>

      <div className={`fixed bottom-6 right-6 z-[100] w-[90vw] max-w-[350px] sm:max-w-[400px] h-[600px] max-h-[80vh] bg-rich-black border border-gold-400/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-50 opacity-0 pointer-events-none'}`}>
        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center backdrop-blur-sm w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center border border-gold-400/30 flex-shrink-0">
              <User size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm tracking-wide truncate">KL Scents Support</h3>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isBanned ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                <span className={`text-xs truncate ${isBanned ? 'text-red-400' : 'text-green-400'}`}>
                  {isBanned ? 'Unavailable' : 'Online'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-2 flex-shrink-0"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/40 w-full overflow-x-hidden">
          {messages.length === 0 && (
            <div className="flex flex-col items-start animate-fade-in mb-6 w-full">
              <div className="p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap break-words sm:break-all bg-white/10 text-white border border-white/5 rounded-tl-sm">
                Hello! Welcome to KL Scents. How can I help you with your order today? 👋
              </div>
            </div>
          )}

          {messages.map((msg, index) => {
            const isUser = msg.sender_role === 'user';
            const isOrderInquiry = msg.metadata && msg.metadata.type === 'order_inquiry';
            const hasImage = msg.metadata?.image_url;

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
                  <div className="w-full text-center my-6 animate-fade-in">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-white/5 px-4 py-1.5 rounded-full truncate">{timeString}</span>
                  </div>
                )}

                <div className={`flex flex-col mb-4 w-full ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}>
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-gold-400/20 flex items-center justify-center mb-1 border border-gold-400/30 flex-shrink-0">
                      <User size={12} className="text-gold-400" />
                    </div>
                  )}

                  {isOrderInquiry ? (
                    <div className="bg-white/5 border border-gold-400/30 p-4 rounded-2xl rounded-tr-sm w-full max-w-[95%] sm:max-w-[90%] text-white text-sm shadow-lg shadow-gold-400/5">
                      <div className="flex items-center gap-2 mb-3 text-gold-400 font-bold border-b border-white/10 pb-2 min-w-0">
                        <ShoppingBag size={16} className="flex-shrink-0" /> <span className="truncate">Order Inquiry #{msg.metadata.order_id}</span>
                      </div>
                      <div className="space-y-1 mb-3 bg-black/40 p-2 rounded w-full">
                        {msg.metadata.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between gap-2 min-w-0">
                            <span className="text-gray-300 truncate min-w-0">{item.quantity}x {item.name} {item.size ? `(${item.size})` : ''}</span>
                            <span className="text-gray-400 flex-shrink-0">₱{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 gap-1 text-[11px] sm:text-xs text-gray-400 mb-3 border-b border-white/10 pb-3 break-words sm:break-all">
                        <div><span className="text-gray-500 font-medium">Method:</span> {msg.metadata.fulfillment}</div>
                        <div><span className="text-gray-500 font-medium">Payment:</span> {msg.metadata.payment}</div>
                        <div><span className="text-gray-500 font-medium">Contact:</span> {msg.metadata.contact}</div>
                        {msg.metadata.location && <div><span className="text-gray-500 font-medium">Location:</span> {msg.metadata.location}</div>}
                      </div>
                      <div className="flex justify-between items-center pt-1 font-bold w-full">
                        <span className="text-gold-400 text-xs sm:text-sm">Total Estimate</span>
                        <span className="text-gold-400 text-sm sm:text-base">₱{msg.metadata.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-2.5 sm:p-3 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed break-words sm:break-all flex flex-col gap-2 ${isUser ? 'bg-gold-400 text-rich-black rounded-tr-sm font-medium' : 'bg-white/10 text-white border border-white/5 rounded-tl-sm'}`}>
                      {hasImage && (
                        <img src={msg.metadata.image_url} alt="Attachment" className="rounded-lg max-w-full h-auto max-h-48 object-cover border border-white/10" />
                      )}
                      {msg.content && <span className="whitespace-pre-wrap">{msg.content}</span>}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm w-full">
          {isBanned ? (
            <div className="flex items-center justify-center gap-2 p-3 text-xs sm:text-sm text-red-400 bg-red-500/10 rounded-lg border border-red-500/20 text-center break-words">
              <AlertCircle size={16} className="flex-shrink-0" /><span>Your messaging privileges have been restricted.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 relative w-full">
              <div className="flex justify-between px-2">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-gold-400 transition-colors" title="Attach Image">
                  <ImageIcon size={14} />
                </button>
                <span className={`text-[10px] font-medium transition-colors ${newMessage.length >= MAX_CHARS ? 'text-red-400' : 'text-gray-500'}`}>
                  {newMessage.length}/{MAX_CHARS}
                </span>
              </div>
              <div className="relative flex items-end w-full">
                <textarea
                  ref={textareaRef}
                  maxLength={MAX_CHARS}
                  value={newMessage}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="w-full bg-black/50 border border-white/20 rounded-2xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors placeholder-gray-500 resize-none overflow-y-auto custom-scrollbar break-words sm:break-all leading-relaxed"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <button
                  type="submit"
                  disabled={isUploading || (!newMessage.trim() && !isUploading)}
                  className="absolute right-2 bottom-2 p-2 bg-gold-400 text-black rounded-full hover:bg-gold-300 disabled:opacity-50 transition-all flex-shrink-0"
                >
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  );
};
export default ChatWidget;