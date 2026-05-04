import React, { useState, useEffect } from 'react';
import { Package, Clock, LogOut, ArrowLeft, Settings, Phone, Loader2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import AddressEditor from '../components/profile/AddressEditor';
import OrderHistoryCard from '../components/profile/OrderHistoryCard';
import UserInvoiceModal from '../components/profile/UserInvoiceModal';

import { useUserOrders } from '../hooks/useUserOrders';
import { useProfile } from '../hooks/useProfile';
import { usePSGC } from '../hooks/usePSGC';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { useUI } from '../contexts/UIContext';

const ProfilePage = () => {
  const { user, handleLogout } = useAuth();
  const { addToCart, showToast } = useShop();
  const { setCurrentPage, setIsCartOpen } = useUI();
  const navigate = useNavigate(); 

  const { orderHistory, isLoading: ordersLoading } = useUserOrders(user?.id);
  const [activeTab, setActiveTab] = useState('history');
  
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const { 
    profileData, setProfileData, isProfileLoading, isSaving, saveProfile, errors,
    identities, handleLinkIdentity, handleUnlinkIdentity, isLinking, handlePasswordResetRequest
  } = useProfile(activeTab);
  
  const { regions, provinces, cities, barangays, getProvinces, getCities, getBarangays, isFetchingLocation } = usePSGC();
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressCodes, setAddressCodes] = useState({ region: '', province: '', city: '', barangay: '' });

  useEffect(() => { if (!user) setCurrentPage('login'); }, [user, setCurrentPage]);

  useEffect(() => {
    if (!isProfileLoading && (!profileData.address || !profileData.address.region)) {
      setIsEditingAddress(true);
    }
  }, [isProfileLoading, profileData.address]);

  const handleReorder = (order) => {
    order.order_items.forEach(item => { 
      if (item.products) {
        const variant = item.product_variants || {};
        addToCart({
          ...item.products,
          price: item.price_at_time, 
          size: variant.size || item.products.size || 'Standard',
          variant_id: item.variant_id
        }, 1, true);
      } 
    });
    showToast('Cart Updated', `Items from Order #${order.id} added to your cart!`);
    setIsCartOpen(true);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const success = await saveProfile();
    if (success) {
      setIsEditingAddress(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-[100dvh] bg-rich-black text-white font-sans flex flex-col">
      <div className="relative z-50"><Header /></div>

      <div className="flex-1 container mx-auto px-6 pt-32 landscape:pt-24 lg:landscape:pt-40 lg:pt-40 pb-24 max-w-4xl animate-fade-in">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center border border-gold-400/50 text-3xl font-bold uppercase">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 truncate max-w-[250px]">My Account</h1>
              <p className="text-gray-400 break-long-text">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg transition-all">
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        <div className="flex gap-4 border-b border-white/10 mb-8">
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'history' ? 'border-gold-400 text-gold-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            <Clock size={16} /> Order History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'settings' ? 'border-gold-400 text-gold-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
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
                <button onClick={() => navigate('/products')} className="text-gold-400 hover:underline inline-flex items-center gap-2">
                  <ArrowLeft size={16} /> Browse Collection
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orderHistory.map(order => (
                  <OrderHistoryCard 
                    key={order.id} 
                    order={order} 
                    onReorder={handleReorder} 
                    onViewInvoice={() => setInvoiceOrder(order)} 
                    navigate={navigate} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 animate-fade-in">
            {isProfileLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-gold-400" size={32} />
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest border-b border-white/10 pb-2">Personal Details</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Phone size={14} className="text-gold-400" /> Phone Number (Optional)
                      </label>
                      <input type="tel" value={profileData.phone_number} onChange={e => { const sanitized = e.target.value.replace(/[^\d+]/g, ''); setProfileData({ ...profileData, phone_number: sanitized }); }} maxLength={13} className={`w-full bg-black/40 border rounded-lg p-3 text-white focus:outline-none transition-colors ${errors?.phone_number ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-gold-400'}`} placeholder="09123456789 or +639..." />
                      {errors?.phone_number && <p className="text-red-400 text-xs mt-1.5">{errors.phone_number}</p>}
                    </div>

                    <AddressEditor
                      profileData={profileData} setProfileData={setProfileData} errors={errors} isEditingAddress={isEditingAddress} setIsEditingAddress={setIsEditingAddress} regions={regions} provinces={provinces} cities={cities} barangays={barangays} getProvinces={getProvinces} getCities={getCities} getBarangays={getBarangays} isFetchingLocation={isFetchingLocation} addressCodes={addressCodes} setAddressCodes={setAddressCodes}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest border-b border-white/10 pb-2">Security</h3>
                  <p className="text-sm text-gray-500 mb-4">Click below to receive a secure link to reset your password. You will be safely logged out.</p>
                  <div>
                    <button 
                      type="button" 
                      onClick={() => handlePasswordResetRequest(user.email)} 
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Mail size={16} /> Send Password Reset Link
                    </button>
                  </div>
                </div>

                {/* CONNECTED ACCOUNTS UI */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-widest border-b border-white/10 pb-2 mt-8">Connected Accounts</h3>
                  <p className="text-sm text-gray-500 mb-4">Link your Google account to log in with one click.</p>
                  
                  <div className="grid grid-cols-1 max-w-md gap-4">
                    <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" viewBox="0 0 48 48">
                          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
                          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
                          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19 5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.229-11.303-7.518l-6.571 4.819C9.656 39.663 16.318 44 24 44z"></path>
                          <path fill="#1976D2" d="M43.611 20.083H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.251 46 30.693 46 24c0-1.341-.138-2.65-.389-3.917z"></path>
                        </svg>
                        <span className="text-white font-medium">Google</span>
                      </div>
                      {identities.some(id => id.provider === 'google') ? (
                        <button type="button" onClick={() => handleUnlinkIdentity('google')} className="text-sm text-red-400 hover:text-red-300">Disconnect</button>
                      ) : (
                        <button type="button" onClick={() => handleLinkIdentity('google')} disabled={isLinking} className="text-sm text-gold-400 hover:text-gold-300">Connect</button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-white/10">
                  <button type="submit" disabled={isSaving || isFetchingLocation} className="flex items-center gap-2 px-8 py-3 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold uppercase tracking-widest rounded transition-all shadow-lg disabled:opacity-70">
                    {isSaving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
      
      <Footer />

      {invoiceOrder && <UserInvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} userEmail={user?.email} />}
    </div>
  );
};

export default ProfilePage;