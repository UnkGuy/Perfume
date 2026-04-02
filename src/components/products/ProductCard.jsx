import React from 'react';
import { Star, Eye, Heart } from 'lucide-react';
import { useShop } from '../../contexts/ShopContext';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

// Look how clean these props are now! Just the things specific to THIS card.
const ProductCard = ({ product, onSelect, onQuickView, isCompact = false }) => {
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishlistItems, showToast } = useShop();
  const { setCurrentPage } = useUI();

  const isInWishlist = wishlistItems?.some(item => item.id === product.id);
  const imageSource = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : FALLBACK_IMAGE;
  const isDiscounted = product.compare_at_price && product.compare_at_price > product.price;
  
  return (
    <div className={`group bg-rich-black border border-white/10 rounded-xl overflow-hidden hover:border-gold-400/50 transition-all duration-300 hover:-translate-y-1 relative flex ${!product.available ? 'opacity-80' : ''} ${isCompact ? 'flex-row h-36 items-stretch' : 'flex-col h-full'}`}>
      
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} className={`bg-rich-black/90 backdrop-blur-sm rounded-full text-white border border-white/10 hover:border-red-500 hover:text-red-500 transition-all shadow-lg ${isCompact ? 'p-1.5' : 'p-2'}`} title="Add to Wishlist">
          <Heart size={isCompact ? 14 : 18} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onQuickView(product); }} className={`bg-rich-black/90 backdrop-blur-sm rounded-full text-white border border-white/10 hover:border-gold-400 hover:text-gold-400 transition-all shadow-lg ${isCompact ? 'p-1.5' : 'p-2'}`} title="Quick View">
          <Eye size={isCompact ? 14 : 18} />
        </button>
      </div>

      <div className={`relative overflow-hidden bg-white/5 cursor-pointer flex-shrink-0 ${isCompact ? 'w-32 md:w-36 h-full' : 'w-full aspect-[4/5]'}`} onClick={() => onSelect(product)}>
          <img src={imageSource} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.available && !isDiscounted && <span className={`bg-gold-400 text-black font-bold rounded-sm uppercase tracking-wider shadow-lg ${isCompact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'}`}>New</span>}
            {product.available && isDiscounted && <span className={`bg-gold-400 text-black font-bold rounded-sm uppercase tracking-wider shadow-lg ${isCompact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'}`}>Sale</span>}
          </div>
          {!product.available && <span className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm text-white font-bold tracking-widest border-2 border-white/20 text-center ${isCompact ? 'text-[8px] m-1' : 'text-xs m-4'}`}>OUT OF STOCK</span>}
      </div>

      <div className={`flex-1 flex flex-col justify-center min-w-0 ${isCompact ? 'p-3' : 'p-4 md:p-5'}`}>
        <div className="flex justify-between items-start mb-1 flex-shrink-0 min-w-0">
            <h3 className={`font-bold text-white group-hover:text-gold-400 transition-colors cursor-pointer truncate pr-2 ${isCompact ? 'text-sm md:text-base' : 'text-lg'}`} onClick={() => onSelect(product)}>
              {product.name}
            </h3>
            <div className={`flex items-center gap-1 flex-shrink-0 ml-2 ${isCompact ? 'hidden sm:flex' : ''}`}>
              <Star size={12} className="fill-gold-400 text-gold-400" />
              <span className="text-xs text-gray-400">{product.rating}</span>
            </div>
        </div>
        
        <p className={`text-gray-500 uppercase tracking-wide truncate flex-shrink-0 ${isCompact ? 'text-[10px] mb-1' : 'text-xs mb-3'}`}>
          {product.brand} • {product.size}
        </p>
        
        {isCompact ? (
          <div className="hidden sm:flex flex-col mb-2 flex-1 min-w-0 min-h-0 overflow-hidden justify-center">
            <p className="text-[10px] text-gray-400 truncate mb-1">{product.description}</p>
            <p className="text-[9px] font-bold tracking-wider text-gold-400/80 truncate uppercase">{product.notes?.join(" • ")}</p>
          </div>
        ) : (
          <div className="text-xs text-gray-400 mb-4 truncate">{product.notes?.join(" • ")}</div>
        )}

        <div className={`mt-auto flex items-center justify-between flex-shrink-0 ${isCompact ? 'pt-2' : 'pt-4 border-t border-white/10'}`}>
          <div className="flex flex-col min-w-0">
            <div className="flex items-end gap-2 truncate">
              <span className={`font-medium text-white ${isCompact ? 'text-sm md:text-base' : 'text-xl'}`}>₱{product.price}</span>
              {isDiscounted && <span className={`text-gray-500 line-through mb-0.5 truncate ${isCompact ? 'text-[10px] hidden sm:inline' : 'text-sm'}`}>₱{product.compare_at_price}</span>}
            </div>
          </div>

          <button 
            disabled={!product.available}
            onClick={(e) => { 
              e.stopPropagation(); 
              if (!user) {
                if (showToast) showToast("Login Required", "Please sign in to add items.", "error");
                setCurrentPage('login');
                return;
              }
              addToCart(product); 
            }}
            className={`rounded-full transition-colors flex items-center justify-center flex-shrink-0 ${isCompact ? 'p-2' : 'p-2.5'} ${product.available ? 'bg-gold-400 text-black hover:bg-gold-300 shadow-md' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
          >
            <span className="sr-only">Add</span>
            <svg xmlns="http://www.w3.org/2000/svg" width={isCompact ? "14" : "18"} height={isCompact ? "14" : "18"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;