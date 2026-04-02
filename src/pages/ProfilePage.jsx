import React, { useState, useEffect } from 'react';
import { Package, Clock, RefreshCw, LogOut, ArrowLeft, Settings, User, MapPin, Phone, Lock, Loader2 } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useUserOrders } from '../hooks/useUserOrders'; 
import { useProfile } from '../hooks/useProfile';

// ✨ NEW Context Imports ✨
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { useUI } from '../contexts/UIContext';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

// ✨ NO PROPS ✨
const ProfilePage = () => {
  const { user, handleLogout } = useAuth();
  const { addToCart, showToast } = useShop();
  const { setCurrentPage, setIsCartOpen } = useUI();

  const { orderHistory, isLoading: ordersLoading } = useUserOrders(user?.id);
  const [activeTab, setActiveTab] = useState('history');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });

  const { profileData, setProfileData, isProfileLoading, isSaving, saveProfile } = useProfile(activeTab);
  
  useEffect(() => {
    if (!user) setCurrentPage('login');
  }, [user, setCurrentPage]);

  const handleReorder = (order) => {
    order.order_items.forEach(item => {
      if (item.products) addToCart(item.products); 
    });
    if (showToast) showToast('Cart Updated', `Items from Order #${order.id} added to your cart!`);
    setIsCartOpen(true); // Open drawer via context!
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const success = await saveProfile(passwords);
    if (success) {
      setPasswords({ newPassword: '', confirmPassword: '' }); 
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans flex flex-col">
      <div className="relative z-50">
        {/* ✨ Clean Header! ✨ */}
        <Header />
      </div>

      <div className="flex-1 container mx-auto px-6 py-24 max-w-4xl animate-fade-in">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center border border-gold-400/50 text-3xl font-bold uppercase">
              {profileData.username ? profileData.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{profileData.username || 'My Account'}</h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg transition-all">
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        <div className="flex gap-4 border-b border-white/10 mb-8">
          <button onClick={() => setActiveTab('history')} className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'history' ? 'border-gold-400 text-gold-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            <Clock size={16} /> Order History
          </button>
          <button onClick={() => setActiveTab('settings')} className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'settings' ? 'border-gold-400 text-gold-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            <Settings size={16} /> Account Settings
          </button>
        </div>

        {activeTab === 'history' && (
          <div className="animate-fade-in">
            {ordersLoading ? (
              <div className="text-center py-12 text-gray-500">Loading your history...</div>
            ) : orderHistory.length === 0 ? (
              <div className="text-center py-16 bg-white/5 border border-white/5 rounded-2xl">
                <Package size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No past inquiries found</h3>
                <p className="text-gray-400 mb-6">You haven't requested any perfumes yet.</p>
                <button onClick={() => setCurrentPage('products')} className="text-gold-400 hover:underline inline-flex items-center gap-2">
                  <ArrowLeft size={16} /> Browse Collection
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orderHistory.map(order => (
                  <OrderHistoryCard key={order.id} order={order} onReorder={handleReorder} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 animate-fade-in">
            {isProfileLoading ? (
              <div className="flex justify-center items-center py-12"><Loader2 className="animate-spin text-gold-400" size={32} /></div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest border-b border-white/10 pb-2">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><User size={14} className="text-gold-400"/> Username</label>
                      <input type="text" value={profileData.username} onChange={(e) => setProfileData({...profileData, username: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Phone size={14} className="text-gold-400"/> Phone Number</label>
                      <input type="text" value={profileData.phone_number} onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" placeholder="+63" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><MapPin size={14} className="text-gold-400"/> Default Delivery Address</label>
                      <textarea value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors resize-none h-24" placeholder="House/Unit No., Street, Barangay, City..." />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest border-b border-white/10 pb-2">Security</h3>
                  <p className="text-sm text-gray-500 mb-4">Leave these fields blank if you do not want to change your password.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Lock size={14} className="text-gold-400"/> New Password</label>
                      <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Lock size={14} className="text-gold-400"/> Confirm New Password</label>
                      <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" placeholder="••••••••" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-white/10">
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold uppercase tracking-widest rounded transition-all shadow-lg disabled:opacity-70">
                    {isSaving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const OrderHistoryCard = ({ order, onReorder }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
    <div className="bg-black/40 p-5 flex flex-wrap justify-between items-center gap-4 border-b border-white/10">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Inquiry #{order.id}</p>
        <p className="text-sm font-medium text-white">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div className="flex items-center gap-6">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Status</p>
          <p className={`text-sm font-bold ${order.status === 'pending' ? 'text-orange-400' : 'text-green-400'}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total</p>
          <p className="text-sm font-bold text-gold-400">₱{order.total_amount.toLocaleString()}</p>
        </div>
      </div>
    </div>
    <div className="p-5">
      <div className="space-y-4 mb-6">
        {order.order_items.map((item, index) => {
          const prod = item.products;
          if (!prod) return null;
          const imageSource = prod.image_urls?.[0] || FALLBACK_IMAGE;

          return (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded overflow-hidden flex-shrink-0">
                <img src={imageSource} alt={prod.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-white">{prod.name}</p>
                <p className="text-xs text-gray-500">{prod.brand} • {prod.size}</p>
              </div>
              <div className="text-right text-sm text-gray-400">
                {item.quantity}x @ ₱{item.price_at_time}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end pt-4 border-t border-white/10">
        <button onClick={() => onReorder(order)} className="flex items-center gap-2 px-5 py-2.5 bg-gold-400/10 text-gold-400 hover:bg-gold-400 hover:text-black border border-gold-400/30 rounded transition-all text-sm font-bold uppercase tracking-wider">
          <RefreshCw size={16} /> Inquire Again
        </button>
      </div>
    </div>
  </div>
);

export default ProfilePage;