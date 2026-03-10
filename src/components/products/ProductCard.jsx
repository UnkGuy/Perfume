import React from 'react';
import { Star, Eye, Heart } from 'lucide-react';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const ProductCard = ({ product, onSelect, onAddToCart, onQuickView, onToggleWishlist, isInWishlist, user, setCurrentPage, showToast }) => {
  const imageSource = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : FALLBACK_IMAGE;
  
  // DISCOUNT LOGIC
  const isDiscounted = product.compare_at_price && product.compare_at_price > product.price;
  
  return (
    <div className={`group bg-rich-black border border-white/10 rounded-xl overflow-hidden hover:border-gold-400/50 transition-all duration-300 hover:-translate-y-1 relative flex flex-col ${!product.available ? 'opacity-80' : ''}`}>
      
      {/* OVERLAY ACTIONS */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
          className="p-2 bg-rich-black/90 backdrop-blur-sm rounded-full text-white border border-white/10 hover:border-red-500 hover:text-red-500 transition-all shadow-lg"
          title="Add to Wishlist"
        >
          <Heart size={18} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
          className="p-2 bg-rich-black/90 backdrop-blur-sm rounded-full text-white border border-white/10 hover:border-gold-400 hover:text-gold-400 transition-all shadow-lg"
          title="Quick View"
        >
          <Eye size={18} />
        </button>
      </div>

      {/* DYNAMIC CARD IMAGE */}
      <div className="relative aspect-[4/5] overflow-hidden bg-white/5 cursor-pointer" onClick={() => onSelect(product)}>
          <img 
            src={imageSource} 
            alt={product.name} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
          />
          
          {/* BADGES */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.available && !isDiscounted && <span className="bg-gold-400 text-black text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider shadow-lg">New</span>}
            {product.available && isDiscounted && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider shadow-lg">Sale</span>}
          </div>

          {!product.available && <span className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm text-white font-bold tracking-widest border-2 border-white/20 m-4">OUT OF STOCK</span>}
      </div>

      {/* Card Info */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-white group-hover:text-gold-400 transition-colors cursor-pointer" onClick={() => onSelect(product)}>{product.name}</h3>
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-gold-400 text-gold-400" />
              <span className="text-xs text-gray-400">{product.rating}</span>
            </div>
        </div>
        <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">{product.brand} • {product.size}</p>
        <div className="text-xs text-gray-400 mb-4 line-clamp-1">{product.notes?.join(" • ")}</div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
          
          {/* PRICE DISPLAY */}
          <div className="flex flex-col">
            <div className="flex items-end gap-2">
              <span className="text-xl font-medium text-white">₱{product.price}</span>
              {isDiscounted && <span className="text-sm text-gray-500 line-through mb-0.5">₱{product.compare_at_price}</span>}
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
            className={`p-2 rounded-full transition-colors ${product.available ? 'bg-gold-400 text-black hover:bg-gold-300' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
            title="Add to Cart"
          >
            <span className="sr-only">Add</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;