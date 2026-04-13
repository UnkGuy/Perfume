import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, AlertCircle, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import { useShop } from '../../contexts/ShopContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const CartDrawer = () => {
  const { user } = useAuth();
  const { cartItems, removeFromCart, showToast, updateQuantity } = useShop();
  const { isCartOpen, setIsCartOpen, setCurrentPage } = useUI();
  const navigate = useNavigate(); 

  const total = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const hasUnavailableItems = cartItems.some(item => !item.available);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsCartOpen(false)}
      />

      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-rich-black border-l border-gold-400/30 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">

          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="text-gold-400" />
              Your Cart <span className="text-sm font-normal text-gray-400">({cartItems.length})</span>
            </h2>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <ShoppingBag size={48} className="text-gray-700" />
                <p className="text-gray-500">Your cart is empty.</p>
                <button onClick={() => { setIsCartOpen(false); navigate('/products'); }} className="text-gold-400 hover:underline">Start Shopping</button>
              </div>
            ) : (
              cartItems.map((item, index) => {
                const imageSource = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : FALLBACK_IMAGE;
                return (
                  <div key={index} className={`flex gap-4 items-start animate-fade-in ${!item.available ? 'opacity-60' : ''}`}>
                    <div 
                      className="w-20 h-20 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 relative cursor-pointer"
                      onClick={() => { setIsCartOpen(false); navigate(`/products/${item.id}`); }}
                    >
                      <img src={imageSource} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <X size={24} className="text-red-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="font-bold text-white text-sm cursor-pointer hover:text-gold-400 transition-colors"
                        onClick={() => { setIsCartOpen(false); navigate(`/products/${item.id}`); }}
                      >
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-xs mb-1">{item.brand} • {item.size}</p>
                      {item.available ? (
                        <div className="flex flex-wrap items-center justify-between mt-1 gap-2">
                          <p className="text-gold-400 font-medium">₱{item.price}</p>
                          <div className="flex items-center gap-2 bg-black/40 rounded px-1.5 py-0.5 border border-white/10">
                            <button onClick={() => updateQuantity(index, -1)} disabled={item.quantity <= 1} className="p-0.5 text-gray-400 hover:text-gold-400 disabled:opacity-30 transition-colors">
                              <Minus size={12} />
                            </button>
                            <span className="text-xs w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(index, 1)} className="p-0.5 text-gray-400 hover:text-gold-400 transition-colors">
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-red-400 text-xs font-bold tracking-wider mt-1">OUT OF STOCK</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-black/20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-2xl font-bold text-white">₱{total.toLocaleString()}</span>
              </div>

              {hasUnavailableItems && (
                <p className="text-xs text-red-400 mb-3 flex items-center justify-center gap-1">
                  <AlertCircle size={14} /> Please remove out-of-stock items to continue.
                </p>
              )}
              <button
                disabled={hasUnavailableItems}
                onClick={() => {
                  if (!user) {
                    if (showToast) showToast("Login Required", "Please sign in to proceed.", "error");
                    setCurrentPage('login');
                    setIsCartOpen(false);
                    return;
                  }
                  setIsCartOpen(false);
                  setCurrentPage('cart');
                }}
                className={`w-full py-4 font-bold rounded flex items-center justify-center gap-2 transition-all 
                  ${hasUnavailableItems
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gold-400 hover:bg-gold-300 text-rich-black shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]'}`}
              >
                Review Inquiry <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;