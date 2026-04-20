import React from 'react';
import { X, Trash2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
import { useShop } from '../../contexts/ShopContext'; 
import { useUI } from '../../contexts/UIContext';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const WishlistDrawer = () => {
  const { wishlistItems, toggleWishlist } = useShop();
  const { isWishlistOpen, setIsWishlistOpen } = useUI();
  const navigate = useNavigate(); 

  const items = wishlistItems || [];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isWishlistOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className={`fixed inset-y-0 right-0 w-full max-w-[90vw] sm:max-w-md bg-rich-black border-l border-gold-400/30 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isWishlistOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full w-full overflow-hidden">
          
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 w-full">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 truncate">
              <Heart className="text-red-500 fill-red-500 flex-shrink-0" /> 
              <span className="truncate">Wishlist</span> 
              <span className="text-sm font-normal text-gray-400 flex-shrink-0">({items.length})</span>
            </h2>
            <button onClick={() => setIsWishlistOpen(false)} className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-2">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar w-full">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
                <Heart size={48} className="text-gray-700" />
                <p className="text-gray-500">Your wishlist is empty.</p>
                <button 
                  onClick={() => {
                    setIsWishlistOpen(false);
                    navigate('/products');
                  }} 
                  className="text-gold-400 hover:underline"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item, index) => {
                const imageSource = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : FALLBACK_IMAGE;
                const variants = item.product_variants || [];
                const displayPrice = variants.length > 0 ? Math.min(...variants.map(v => v.price)) : 0;

                return (
                  <div key={index} className="flex gap-3 sm:gap-4 items-start animate-fade-in bg-white/5 p-3 rounded-lg border border-white/5 w-full min-w-0">
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                      onClick={() => { setIsWishlistOpen(false); navigate(`/products/${item.id}`); }}
                    >
                      <img src={imageSource} alt={item.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-bold text-white text-xs sm:text-sm cursor-pointer hover:text-gold-400 transition-colors line-clamp-2 break-words"
                        onClick={() => { setIsWishlistOpen(false); navigate(`/products/${item.id}`); }}
                      >
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-[10px] sm:text-xs mb-1 sm:mb-2 truncate">{item.brand}</p>
                      <p className="text-gold-400 font-medium mb-2 sm:mb-3 text-sm truncate">₱{displayPrice}</p>
                      
                      <div className="flex items-center gap-3">
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