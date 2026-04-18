import React, { useState, useEffect } from 'react';
import { Package, Clock, RefreshCw, LogOut, ArrowLeft, Settings, User, Phone, Lock, Loader2, FileText, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import AddressEditor from '../components/profile/AddressEditor';
import { useUserOrders } from '../hooks/useUserOrders';
import { useProfile } from '../hooks/useProfile';
import { usePSGC } from '../hooks/usePSGC';
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';
import { useUI } from '../contexts/UIContext';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const ProfilePage = () => {
  const { user, handleLogout } = useAuth();
  const { addToCart, showToast } = useShop();
  const { setCurrentPage, setIsCartOpen } = useUI();
  const navigate = useNavigate(); 

  const { orderHistory, isLoading: ordersLoading } = useUserOrders(user?.id);
  const [activeTab, setActiveTab] = useState('history');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const { profileData, setProfileData, isProfileLoading, isSaving, saveProfile, errors, hasPassword } = useProfile(activeTab);
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
    const success = await saveProfile(passwords);
    if (success) {
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsEditingAddress(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans flex flex-col print:bg-white">
      <div className={`relative z-50 ${invoiceOrder ? 'print:hidden' : ''}`}><Header /></div>

      <div className={`flex-1 container mx-auto px-6 py-24 max-w-4xl animate-fade-in ${invoiceOrder ? 'print:hidden' : ''}`}>

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
                {/* Profile Form Content (Omitted unchanged fields for brevity) */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-widest border-b border-white/10 pb-2">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <User size={14} className="text-gold-400" /> Username
                      </label>
                      <input type="text" value={profileData.username} onChange={e => setProfileData({ ...profileData, username: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" />
                    </div>
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
                  <p className="text-sm text-gray-500 mb-4">{hasPassword ? "Leave these fields blank if you do not want to change your password." : "You signed in with a social account. Set a password here to enable email login."}</p>
                  <div className={`grid grid-cols-1 ${hasPassword ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
                    {hasPassword && (
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Lock size={14} className="text-gold-400" /> Current Password</label>
                        <input type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" placeholder="••••••••" />
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Lock size={14} className="text-gold-400" /> {hasPassword ? 'New Password' : 'Set Password'}</label>
                      <input type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2"><Lock size={14} className="text-gold-400" /> Confirm Password</label>
                      <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-gold-400 outline-none transition-colors" placeholder="••••••••" />
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
      
      <div className={invoiceOrder ? 'print:hidden' : ''}><Footer /></div>

      {/* ✨ The Invoice Modal renders outside the hidden boundaries! ✨ */}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} userEmail={user?.email} />}
    </div>
  );
};

const OrderHistoryCard = ({ order, onReorder, onViewInvoice, navigate }) => (
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
          const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
          
          if (!prod) return null;

          const imageSource = variant?.image_url || prod.image_urls?.[0] || FALLBACK_IMAGE;
          const displaySize = variant?.size || prod.size || 'Standard';

          return (
            <div key={index} className="flex items-center gap-4">
              <div 
                className="w-16 h-16 bg-white/10 rounded overflow-hidden flex-shrink-0 cursor-pointer"
                onClick={() => navigate(`/products/${prod.id}`)}
              >
                <img src={imageSource} alt={prod.name} className="w-full h-full object-cover transition-transform hover:scale-110" />
              </div>
              <div className="flex-1">
                <p 
                  className="font-bold text-sm text-white cursor-pointer hover:text-gold-400 transition-colors"
                  onClick={() => navigate(`/products/${prod.id}`)}
                >
                  {prod.name}
                </p>
                <p className="text-xs text-gray-500">{prod.brand} • {displaySize}</p>
              </div>
              <div className="text-right text-sm text-gray-400">
                {item.quantity}x @ ₱{item.price_at_time}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-white/10">
        <button 
          onClick={() => onViewInvoice()} 
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border border-blue-500/30 rounded transition-all text-sm font-bold uppercase tracking-wider"
        >
          <FileText size={16} /> View Invoice
        </button>
        <button 
          onClick={() => onReorder(order)} 
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-400/10 text-gold-400 hover:bg-gold-400 hover:text-black border border-gold-400/30 rounded transition-all text-sm font-bold uppercase tracking-wider"
        >
          <RefreshCw size={16} /> Inquire Again
        </button>
      </div>
    </div>
  </div>
);

// ─── ✨ INVOICE MODAL ✨ ──────────────────────────────────────────────
const InvoiceModal = ({ order, onClose, userEmail }) => {
  const handlePrint = () => window.print();
  const baseTotal = order.order_items.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:static print:bg-white print:p-0 print:block [print-color-adjust:exact]">
      
      {/* ✨ The Magic CSS Fix to force a white background over the app when printing ✨ */}
      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 0mm; }
          body, html { background-color: white !important; }
        `}
      </style>

      <div className="absolute top-6 right-6 flex gap-3 print:hidden">
        <button onClick={handlePrint} className="flex items-center gap-2 bg-gold-400 text-black px-4 py-2 rounded font-bold shadow-lg hover:bg-gold-300">
          <Printer size={16} /> Print PDF
        </button>
        <button onClick={onClose} className="bg-white/10 text-white px-4 py-2 rounded hover:bg-white/20 border border-white/20">Close</button>
      </div>

      <div className="bg-white text-black w-full max-w-2xl p-10 md:p-12 rounded-xl shadow-2xl overflow-y-auto max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none print:w-full print:m-0 print:p-8">
        
        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-widest text-gray-900">KL SCENTS</h1>
            <p className="text-sm text-gray-500 mt-1">Premium Fragrance Collection</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
            <p className="text-sm text-gray-500 font-mono mt-1">#{order.id}</p>
            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Billed To</h3>
          <p className="text-sm font-medium text-gray-800">{userEmail}</p>
          {order.metadata?.location && <p className="text-sm text-gray-600 mt-1 max-w-xs">{order.metadata.location}</p>}
          {order.metadata?.contact && <p className="text-sm text-gray-600 mt-1">{order.metadata.contact}</p>}
        </div>

        <table className="w-full text-left border-collapse mb-6">
          <thead>
            <tr className="border-b-2 border-gray-200 text-xs uppercase tracking-wider text-gray-500">
              <th className="py-3 font-bold">Item Description</th>
              <th className="py-3 font-bold text-center">Qty</th>
              <th className="py-3 font-bold text-right">Price</th>
              <th className="py-3 font-bold text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
            {order.order_items.map((item, idx) => {
              const variant = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;
              return (
                <tr key={idx}>
                  <td className="py-4">
                    <p className="font-bold">{item.products?.name}</p>
                    <p className="text-xs text-gray-500">{variant?.size || 'Standard'}</p>
                  </td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right">₱{item.price_at_time.toLocaleString()}</td>
                  <td className="py-4 text-right font-medium">₱{(item.price_at_time * item.quantity).toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="w-full flex justify-end">
          <div className="w-full sm:w-1/2 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₱{baseTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-200 pt-3 mt-3">
              <span>Total</span>
              <span>₱{Number(order.total_amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>Thank you for shopping with KL Scents.</p>
          <p className="mt-1">If you have any questions concerning this invoice, please message us via the support widget.</p>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;