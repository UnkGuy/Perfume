import React from 'react';
import { Star, X, Heart } from 'lucide-react';
import perfumeImage from '../../assets/images/perfume.jpg';

const QuickViewModal = ({ product, onClose, onAddToCart, onToggleWishlist, isInWishlist }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-rich-black border border-gold-400/30 rounded-2xl max-w-3xl w-full relative shadow-2xl overflow-hidden flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 z-10 text-gray-500 hover:text-white" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="w-full md:w-1/2 h-64 md:h-auto bg-white/5 relative">
          <img src={perfumeImage} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <span className="text-gold-400 text-xs font-bold tracking-widest uppercase mb-2">{product.brand}</span>
          <h2 className="text-2xl font-bold text-white mb-2">{product.name}</h2>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-gold-400"><Star size={14} className="fill-gold-400" /> <span className="ml-1 text-sm">{product.rating}</span></div>
            <span className="text-xs text-gray-500">• {product.size}</span>
          </div>
          
          <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
             Experience the essence of luxury. Notes of {product.notes.join(", ")}. This fragrance is designed to leave a lasting impression.
          </p>

          <div className="flex items-center justify-between mb-8">
             <span className="text-3xl font-light text-white">₱{product.price}</span>
             <span className={`text-xs px-2 py-1 rounded ${product.available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {product.available ? 'In Stock' : 'Out of Stock'}
             </span>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => { if (product.available) { onAddToCart(product); onClose(); }}}
              disabled={!product.available}
              className="flex-1 py-3 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
            <button 
              onClick={() => onToggleWishlist(product)}
              className="p-3 border border-white/10 rounded hover:border-red-500 hover:text-red-500 transition-colors"
            >
              <Heart size={20} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;