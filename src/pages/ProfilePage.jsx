import React, { useState, useEffect } from 'react';
import { Package, Clock, RefreshCw, LogOut, User as UserIcon, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const ProfilePage = ({ 
  setCurrentPage, user, handleLogout, addToCart, showToast,
  cartItems, wishlistItems, onCartClick, onWishlistClick, searchQuery, setSearchQuery
}) => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If a guest tries to access this page, kick them back to login
    if (!user) {
      setCurrentPage('login');
      return;
    }

    const fetchOrderHistory = async () => {
      setIsLoading(true);
      
      // The Magic Supabase Query: Fetch orders -> order_items -> products
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, created_at, status, total_amount,
          order_items (
            quantity, price_at_time,
            products (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching history:", error);
      } else if (data) {
        setOrderHistory(data);
      }
      
      setIsLoading(false);
    };

    fetchOrderHistory();
  }, [user, setCurrentPage]);

  // --- REORDER LOGIC ---
  const handleReorder = (order) => {
    // Loop through the past order and add every product back to the cart
    order.order_items.forEach(item => {
      if (item.products) {
        // We simulate adding it by calling the global addToCart function
        addToCart(item.products); 
      }
    });
    
    if (showToast) showToast('Cart Updated', `Items from Order #${order.id} added to your cart!`);
    onCartClick(); // Open the cart drawer
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans flex flex-col">
      <div className="relative z-50">
        <Header 
          setCurrentPage={setCurrentPage} cartItems={cartItems} wishlistItems={wishlistItems}
          onCartClick={onCartClick} onWishlistClick={onWishlistClick}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          user={user} handleLogout={handleLogout}
        />
      </div>

      <div className="flex-1 container mx-auto px-6 py-24 max-w-4xl animate-fade-in">
        
        {/* Profile Header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center border border-gold-400/50 text-3xl font-bold uppercase">
              {user.email.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">My Account</h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg transition-all"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Order History Section */}
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Clock className="text-gold-400" /> Past Inquiries
        </h2>

        {isLoading ? (
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
              <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
                
                {/* Order Header */}
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

                {/* Order Items */}
                <div className="p-5">
                  <div className="space-y-4 mb-6">
                    {order.order_items.map(item => {
                      const prod = item.products;
                      if (!prod) return null;
                      const imageSource = prod.image_url ? prod.image_url : FALLBACK_IMAGE;

                      return (
                        <div key={item.id} className="flex items-center gap-4">
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
                    <button 
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gold-400/10 text-gold-400 hover:bg-gold-400 hover:text-black border border-gold-400/30 rounded transition-all text-sm font-bold uppercase tracking-wider"
                    >
                      <RefreshCw size={16} /> Inquire Again
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;