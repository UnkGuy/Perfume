import React from 'react';
import { Star, Eye, Heart } from 'lucide-react';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const ProductCard = ({ 
  product, onSelect, onAddToCart, onQuickView, onToggleWishlist, 
  isInWishlist, user, setCurrentPage, showToast, isCompact = false 
}) => {
  const imageSource = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : FALLBACK_IMAGE;
  
  // DISCOUNT LOGIC
  const isDiscounted = product.compare_at_price && product.compare_at_price > product.price;
  
  return (
    <div className={`group bg-rich-black border border-white/10 rounded-xl overflow-hidden hover:border-gold-400/50 transition-all duration-300 hover:-translate-y-1 relative flex ${!product.available ? 'opacity-80' : ''} ${isCompact ? 'flex-row h-32 items-center' : 'flex-col'}`}>
      
      {/* OVERLAY ACTIONS (Top Right) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
          className={`bg-rich-black/90 backdrop-blur-sm rounded-full text-white border border-white/10 hover:border-red-500 hover:text-red-500 transition-all shadow-lg ${isCompact ? 'p-1.5' : 'p-2'}`}
          title="Add to Wishlist"
        >
          <Heart size={isCompact ? 14 : 18} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
          className={`bg-rich-black/90 backdrop-blur-sm rounded-full text-white border border-white/10 hover:border-gold-400 hover:text-gold-400 transition-all shadow-lg ${isCompact ? 'p-1.5' : 'p-2'}`}
          title="Quick View"
        >
          <Eye size={isCompact ? 14 : 18} />
        </button>
      </div>

      {/* DYNAMIC CARD IMAGE */}
      {/* ✨ In compact mode, we lock the width and height to make it a small square thumbnail ✨ */}
      <div 
        className={`relative overflow-hidden bg-white/5 cursor-pointer flex-shrink-0 ${isCompact ? 'w-32 h-32' : 'w-full aspect-[4/5]'}`} 
        onClick={() => onSelect(product)}
      >
          <img 
            src={imageSource} 
            alt={product.name} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
          />
          
          {/* BADGES */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.available && !isDiscounted && <span className="bg-gold-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-lg">New</span>}
            {product.available && isDiscounted && <span className="bg-gold-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-lg">Sale</span>}
          </div>

          {!product.available && <span className={`absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm text-white font-bold tracking-widest border-2 border-white/20 text-center ${isCompact ? 'text-[8px] m-1' : 'text-xs m-4'}`}>OUT OF STOCK</span>}
      </div>

      {/* Card Info */}
      {/* ✨ In compact mode, this text block fills the remaining horizontal space ✨ */}
      <div className={`flex-1 flex flex-col justify-center h-full ${isCompact ? 'p-3' : 'p-3 md:p-5'}`}>
        <div className="flex justify-between items-start mb-1">
            <h3 
              className={`font-bold text-white group-hover:text-gold-400 transition-colors cursor-pointer ${isCompact ? 'text-base line-clamp-1 pr-6' : 'text-lg'}`} 
              onClick={() => onSelect(product)}
            >
              {product.name}
            </h3>
            
            {/* Show rating in both views now, but smaller in compact */}
            <div className={`flex items-center gap-1 flex-shrink-0 ml-2 ${isCompact ? 'hidden sm:flex' : ''}`}>
              <Star size={12} className="fill-gold-400 text-gold-400" />
              <span className="text-xs text-gray-400">{product.rating}</span>
            </div>
        </div>
        
        <p className={`text-gray-500 uppercase tracking-wide ${isCompact ? 'text-[10px] mb-2 line-clamp-1' : 'text-xs mb-3'}`}>
          {product.brand} • {product.size}
        </p>
        
        {/* Only show fragrance notes on the Large View */}
        {!isCompact && (
          <div className="text-xs text-gray-400 mb-4 line-clamp-1">{product.notes?.join(" • ")}</div>
        )}

        {/* Action Row - No top border in compact mode to keep it clean */}
        <div className={`mt-auto flex items-center justify-between ${isCompact ? 'pt-1' : 'pt-4 border-t border-white/10'}`}>
          
          {/* PRICE DISPLAY */}
          <div className="flex flex-col">
            <div className="flex items-end gap-2">
              <span className={`font-medium text-white ${isCompact ? 'text-lg' : 'text-xl'}`}>₱{product.price}</span>
              {isDiscounted && <span className={`text-gray-500 line-through mb-0.5 ${isCompact ? 'text-xs' : 'text-sm'}`}>₱{product.compare_at_price}</span>}
            </div>
          </div>

          <button 
            disabled={!product.available}
            onClick={(e) => { 
              e.stopPropagation(); 
              if (!user) {
                if (showToast) showToast("Login Required", "Please sign in to add items to your cart.", "error");
                setCurrentPage('login');
                return;
              }
              onAddToCart(product); 
            }}
            className={`rounded-full transition-colors flex items-center justify-center ${isCompact ? 'p-2' : 'p-2.5'} ${product.available ? 'bg-gold-400 text-black hover:bg-gold-300 shadow-md' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
            title="Add to Cart"
          >
            <span className="sr-only">Add</span>
            <svg xmlns="http://www.w3.org/2000/svg" width={isCompact ? "16" : "18"} height={isCompact ? "16" : "18"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;