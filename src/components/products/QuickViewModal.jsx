import React from 'react';
import { Star, X, Heart } from 'lucide-react';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

// Add user, setCurrentPage, and showToast here!
const QuickViewModal = ({ 
  product, onClose, onAddToCart, onToggleWishlist, isInWishlist,
  user, setCurrentPage, showToast 
}) => {
  if (!product) return null;

  const imageSource = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : FALLBACK_IMAGE;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-rich-black border border-gold-400/30 rounded-2xl max-w-3xl w-full relative shadow-2xl overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
        
        <button className="absolute top-4 right-4 z-10 text-gray-500 hover:text-white transition-colors" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="w-full md:w-1/2 h-64 md:h-auto bg-white/5 relative">
          <img 
            src={imageSource} 
            alt={product.name} 
            loading="lazy"
            className="w-full h-full object-cover" 
          />
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold tracking-widest text-gold-400 uppercase">{product.brand}</span>
            <span className="text-gray-600">•</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{product.size}</span>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < Math.floor(product.rating) ? "fill-gold-400 text-gold-400" : "fill-gray-700 text-gray-700"} />
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.rating})</span>
          </div>

          <p className="text-2xl font-light text-white mb-6">₱{product.price}</p>

          <div className="mb-8 flex-1">
            <p className="text-sm text-gray-400 mb-2">Key Notes:</p>
            <p className="text-sm text-gray-300 font-medium">{product.notes?.join(", ")}</p>
          </div>

          <div className="flex gap-4 mt-auto">
            <button 
              disabled={!product.available}
              onClick={() => { 
                // GUEST CHECK
                if (!user) {
                  if (showToast) showToast("Login Required", "Please sign in to add to cart.", "error");
                  setCurrentPage('login');
                  onClose();
                  return;
                }
                onAddToCart(product); 
                onClose(); 
              }}
              className={`flex-1 py-3 font-bold rounded transition-colors
                ${product.available ? 'bg-gold-400 hover:bg-gold-300 text-rich-black' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
              `}
            >
              {product.available ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button 
              onClick={() => onToggleWishlist(product)}
              className={`p-3 rounded border transition-colors ${isInWishlist ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-white/10 hover:border-white/30 text-white'}`}
            >
              <Heart size={20} className={isInWishlist ? "fill-red-500" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;