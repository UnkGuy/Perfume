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

      <div className={`fixed inset-y-0 right-0 w-full max-w-[90vw] sm:max-w-md bg-rich-black border-l border-gold-400/30 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full w-full overflow-hidden">

          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 w-full">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 truncate">
              <ShoppingBag className="text-gold-400 flex-shrink-0" />
              <span className="truncate">Your Cart</span>
              <span className="text-sm font-normal text-gray-400 flex-shrink-0">({cartItems.length})</span>
            </h2>
            <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-2">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar w-full">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                <ShoppingBag size={48} className="text-gray-700" />
                <p className="text-gray-500">Your cart is empty.</p>
                <button onClick={() => { setIsCartOpen(false); navigate('/products'); }} className="text-gold-400 hover:underline">Start Shopping</button>
              </div>
            ) : (
              cartItems.map((item, index) => {
                const imageSource = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : FALLBACK_IMAGE;
                return (
                  <div key={index} className={`flex gap-3 sm:gap-4 items-start animate-fade-in w-full min-w-0 ${!item.available ? 'opacity-60' : ''}`}>
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 relative cursor-pointer"
                      onClick={() => { setIsCartOpen(false); navigate(`/products/${item.id}`); }}
                    >
                      <img src={imageSource} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                      {!item.available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <X size={20} className="text-red-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-bold text-white text-xs sm:text-sm cursor-pointer hover:text-gold-400 transition-colors line-clamp-2 break-words"
                        onClick={() => { setIsCartOpen(false); navigate(`/products/${item.id}`); }}
                      >
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-[10px] sm:text-xs mb-1 truncate">{item.brand} • {item.size}</p>
                      {item.available ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1 gap-2 w-full">
                          <p className="text-gold-400 font-medium text-sm truncate">₱{item.price}</p>
                          <div className="flex items-center gap-2 bg-black/40 rounded px-1.5 py-0.5 border border-white/10 w-fit">
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
                        <p className="text-red-400 text-[10px] sm:text-xs font-bold tracking-wider mt-1 whitespace-nowrap">OUT OF STOCK</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1.5 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-white/10 bg-black/20 w-full">
              <div className="flex justify-between items-center mb-4 min-w-0">
                <span className="text-gray-400 text-sm">Subtotal</span>
                <span className="text-lg sm:text-2xl font-bold text-white truncate max-w-[60%] text-right">₱{total.toLocaleString()}</span>
              </div>

              {hasUnavailableItems && (
                <p className="text-[10px] sm:text-xs text-red-400 mb-3 flex items-center justify-center gap-1 text-center break-words">
                  <AlertCircle size={14} className="flex-shrink-0" /> Please remove out-of-stock items.
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
                className={`w-full py-3 sm:py-4 text-sm sm:text-base font-bold rounded flex items-center justify-center gap-2 transition-all 
                  ${hasUnavailableItems
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gold-400 hover:bg-gold-300 text-rich-black shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]'}`}
              >
                Review Inquiry <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;