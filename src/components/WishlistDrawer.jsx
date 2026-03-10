import React from 'react';
import { X, Trash2, Heart, ShoppingCart } from 'lucide-react';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const WishlistDrawer = ({ isOpen, onClose, wishlistItems, toggleWishlist, addToCart }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-rich-black border-l border-gold-400/30 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Heart className="text-red-500 fill-red-500" /> 
              Wishlist <span className="text-sm font-normal text-gray-400">({wishlistItems.length})</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {wishlistItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <Heart size={48} className="text-gray-700" />
                <p className="text-gray-500">Your wishlist is empty.</p>
                <button onClick={onClose} className="text-gold-400 hover:underline">Explore Collection</button>
              </div>
            ) : (
              wishlistItems.map((item, index) => {
                // FIXED IMAGE LOGIC FOR MULTI-IMAGE
                const imageSource = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : FALLBACK_IMAGE;

                return (
                  <div key={index} className="flex gap-4 items-start animate-fade-in bg-white/5 p-3 rounded-lg border border-white/5">
                    <div className="w-20 h-20 bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={imageSource} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-sm">{item.name}</h3>
                      <p className="text-gray-500 text-xs mb-2">{item.brand}</p>
                      <p className="text-gold-400 font-medium mb-3">₱{item.price}</p>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            if(item.available) {
                              addToCart(item);
                              toggleWishlist(item); 
                            }
                          }}
                          disabled={!item.available}
                          className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${item.available ? 'bg-gold-400 text-black hover:bg-gold-300' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                          <ShoppingCart size={14} /> Add to Cart
                        </button>
                        <button 
                          onClick={() => toggleWishlist(item)}
                          className="text-gray-500 hover:text-red-400 transition-colors p-1"
                          title="Remove from Wishlist"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WishlistDrawer;