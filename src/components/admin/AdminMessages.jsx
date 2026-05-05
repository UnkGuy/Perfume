// src/components/admin/AdminMessages.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  User, Send, ShoppingBag, Loader2, Ban, CheckCircle,
  Search, ArrowLeft, MessageSquare, Package, ImageIcon, X,
} from 'lucide-react';
import { useActiveChats, useMessageThread } from '../../hooks/useMessages';
import { useUserBan } from '../../hooks/useUserBan';
import { useShop } from '../../contexts/ShopContext';
import { supabase } from '../../services/supabase';

const STATUS_COLORS = {
  pending:   'bg-orange-500/10 text-orange-400 border-orange-500/30', 
  shipped:   'bg-blue-500/10 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/10 text-green-400 border-green-500/30',
  canceled:  'bg-red-500/10 text-red-400 border-red-500/30',
};

const MAX_CHARS = 250;

const AdminMessages = ({ defaultSelectedUser }) => {
  const { showToast } = useShop();
  
  const [selectedUser, setSelectedUser] = useState(defaultSelectedUser || null);
  const [reply, setReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [latestOrder, setLatestOrder] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);

  const { activeChats, isLoading: chatsLoading } = useActiveChats();
  const { messages, sendMessage, uploadChatImage, markAsSeen } = useMessageThread(selectedUser, 'admin');
  const { isBanned, toggleBan } = useUserBan(selectedUser);

  useEffect(() => {
    if (defaultSelectedUser) {
      setSelectedUser(defaultSelectedUser);
    }
  }, [defaultSelectedUser]);

  useEffect(() => {
    if (!selectedUser) { setLatestOrder(null); return; }
    const fetchLatestOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('user_id', selectedUser)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setLatestOrder(data || null);
    };
    fetchLatestOrder();
  }, [selectedUser, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as seen when a user is selected or when new messages arrive
  useEffect(() => {
    if (selectedUser) {
      markAsSeen();
    }
  }, [selectedUser, messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Error', 'Please select a valid image file.', 'error');
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setImagePreview({ file, localUrl });
    e.target.value = '';
  };

  const clearImagePreview = () => {
    if (imagePreview?.localUrl) URL.revokeObjectURL(imagePreview.localUrl);
    setImagePreview(null);
  };

  const handleReply = async (e) => {
    e?.preventDefault();
    const hasText  = reply.trim().length > 0;
    const hasImage = !!imagePreview;
    if ((!hasText && !hasImage) || reply.length > MAX_CHARS || isUploading) return;

    setIsUploading(true);
    try {
      let imageUrl = null;
      if (hasImage) {
        imageUrl = await uploadChatImage(imagePreview.file);
        clearImagePreview();
      }
      const { success } = await sendMessage(reply, imageUrl);
      if (success) {
        setReply('');
      } else {
        showToast('Error', 'Failed to send message.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Image upload failed.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleReply(e);
    }
  };

  const selectedChatData = activeChats.find(c => c.id === selectedUser);
  const filteredChats    = activeChats.filter(chat =>
    chat.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canSend = (reply.trim().length > 0 || !!imagePreview) &&
                  reply.length <= MAX_CHARS &&
                  !isUploading;

  return (
    <div className="h-[600px] md:h-[70vh] w-full bg-rich-black border border-white/10 rounded-xl overflow-hidden flex animate-fade-in relative shadow-2xl">
      {/* Left panel */}
      <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-white/10 flex-col bg-black/40 min-w-0 flex-shrink-0`}>
        <div className="p-4 border-b border-white/10 flex flex-col gap-3">
          <h3 className="font-bold text-white tracking-widest uppercase text-sm">Active Inquiries</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chatsLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gold-400" /></div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No active chats found.</div>
          ) : filteredChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setSelectedUser(chat.id)}
              className={`w-full p-4 flex items-center gap-3 text-left transition-colors border-b border-white/5 relative ${selectedUser === chat.id ? 'bg-gold-400/10' : 'hover:bg-white/5'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${selectedUser === chat.id ? 'bg-gold-400 text-black' : 'bg-white/10 text-white'}`}>
                <User size={16} />
              </div>
              <div className="overflow-hidden flex-1">
                <div className="flex justify-between items-center mb-0.5">
                  <p className={`text-sm truncate pr-2 ${selectedUser === chat.id ? 'text-gold-400 font-bold' : (chat.hasUnread ? 'text-white font-bold' : 'text-gray-300')}`}>
                    {chat.email}
                  </p>
                  <div className="flex items-center gap-2">
                    {/* Unread indicator */}
                    {chat.hasUnread && selectedUser !== chat.id && (
                      <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse"></span>
                    )}
                    <p className="text-[10px] text-gray-500 flex-shrink-0">
                      {new Date(chat.lastActive).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={`text-xs truncate ${chat.hasUnread && selectedUser !== chat.id ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                  {chat.hasUnread ? 'New message...' : 'Tap to view messages...'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className={`${!selectedUser ? 'hidden md:flex' : 'flex'} w-full md:w-2/3 flex-col relative min-w-0 overflow-hidden`}>
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-white/5">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Select a customer on the left to view messages.</p>
          </div>
        ) : (
          <>
            <div className="p-3 md:p-4 border-b border-white/10 bg-black/20 sticky top-0 z-10 backdrop-blur-md">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden p-1.5 -ml-1.5 text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-white text-sm md:text-base truncate">{selectedChatData?.email || 'Loading...'}</span>
                    {isBanned && <span className="text-[10px] text-red-400 font-bold tracking-widest">RESTRICTED USER</span>}
                  </div>
                </div>

                <button
                  onClick={() => toggleBan(!isBanned)}
                  className={`flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 rounded text-[10px] md:text-xs font-bold transition-colors flex-shrink-0 ${
                    isBanned
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  {isBanned
                    ? <><CheckCircle size={14} className="hidden sm:block" /> Unblock</>
                    : <><Ban size={14} className="hidden sm:block" /> Block</>}
                </button>
              </div>

              {latestOrder && (
                <div className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium w-fit max-w-full overflow-hidden ${STATUS_COLORS[latestOrder.status] || STATUS_COLORS.pending}`}>
                  <Package size={12} className="flex-shrink-0" />
                  <span className="truncate">Latest Order #{latestOrder.id}:</span>
                  <span className="font-bold uppercase tracking-wider flex-shrink-0">{latestOrder.status}</span>
                  <span className="text-inherit opacity-60 flex-shrink-0">· ₱{Number(latestOrder.total_amount).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar bg-black/10 min-w-0">
              {messages.map((msg, index) => {
                const isAdmin = msg.sender_role === 'admin';
                const isOrder = msg.metadata?.type === 'order_inquiry';
                const hasImage = msg.metadata?.image_url;
                const isOptimistic = !!msg._optimistic;

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
                  timeString = new Date(msg.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  });
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

                    <div className={`flex flex-col mb-4 w-full min-w-0 ${isAdmin ? 'items-end' : 'items-start'}`}>
                      {isOrder ? (
                        <div className="bg-black/60 border border-gold-400/30 p-3 md:p-4 rounded-xl w-full max-w-[95%] md:max-w-[90%] text-sm shadow-lg overflow-hidden">
                          <div className="flex flex-wrap items-center gap-2 mb-3 text-gold-400 font-bold border-b border-white/10 pb-2">
                            <ShoppingBag size={16} /> Order #{msg.metadata.order_id}
                          </div>
                          <div className="space-y-1 mb-3 bg-white/5 p-2 md:p-3 rounded text-xs md:text-sm">
                            {msg.metadata.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between gap-4">
                                <span className="text-gray-300 truncate">{item.quantity}x {item.name} {item.size ? `(${item.size})` : ''}</span>
                                <span className="text-gray-400 flex-shrink-0">₱{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] md:text-xs text-gray-400 mb-3 break-all">
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
                        <div className={`p-2.5 md:p-3 rounded-2xl max-w-[85%] md:max-w-[75%] text-xs md:text-sm whitespace-pre-wrap break-all overflow-hidden flex flex-col gap-2 transition-opacity ${
                          isOptimistic ? 'opacity-60' : 'opacity-100'
                        } ${isAdmin ? 'bg-gold-400 text-black rounded-tr-sm' : 'bg-white/10 text-white border border-white/10 rounded-tl-sm'}`}>
                          {hasImage && (
                            <img
                              src={msg.metadata.image_url}
                              alt="Attachment"
                              className="rounded-lg max-w-full h-auto max-h-48 object-cover border border-white/10"
                            />
                          )}
                          {msg.content && <span>{msg.content}</span>}
                          {isOptimistic && (
                            <span className="text-[9px] opacity-50 self-end">Sending…</span>
                          )}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleReply}
              className="p-3 md:p-4 border-t border-white/10 bg-black/40 flex flex-col gap-2 relative w-full min-w-0"
            >
              {imagePreview && (
                <div className="relative w-fit">
                  <img
                    src={imagePreview.localUrl}
                    alt="Preview"
                    className="h-20 rounded-lg object-cover border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={clearImagePreview}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-400 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between px-1">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-gray-400 hover:text-gold-400 transition-colors disabled:opacity-50"
                    title="Attach Image"
                  >
                    <ImageIcon size={16} />
                  </button>
                </div>

                <span className={`text-[10px] font-medium transition-colors ${
                  reply.length >= MAX_CHARS       ? 'text-red-400' :
                  reply.length >= MAX_CHARS * 0.8 ? 'text-gold-400' : 'text-gray-500'
                }`}>
                  {reply.length}/{MAX_CHARS}
                </span>
              </div>

              <div className="relative w-full min-w-0 overflow-hidden">
                <div className="grid w-full min-w-0">
                  <div
                    aria-hidden="true"
                    className="invisible whitespace-pre-wrap break-all col-start-1 col-end-2 row-start-1 row-end-2 py-3 pl-4 pr-12 text-sm leading-relaxed border border-transparent min-h-[3rem] max-h-[25vh] overflow-hidden w-full"
                  >
                    {reply + ' '}
                  </div>

                  <textarea
                    maxLength={MAX_CHARS}
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a reply…"
                    className="w-full h-full resize-none col-start-1 col-end-2 row-start-1 row-end-2 bg-black/50 border border-white/20 rounded-2xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors custom-scrollbar break-all leading-relaxed overflow-y-auto"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canSend}
                  className="absolute right-1.5 md:right-2 bottom-1.5 md:bottom-2 p-1.5 md:p-2 bg-gold-400 text-black rounded-full hover:bg-gold-300 disabled:opacity-50 transition-all z-10"
                >
                  {isUploading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Send size={16} />}
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