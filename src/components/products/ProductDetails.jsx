import React from 'react';
import { Star, ArrowLeft, Heart, Check, AlertCircle } from 'lucide-react';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const ProductDetails = ({ product, onBack, onAddToCart, onToggleWishlist, isInWishlist, onOpenReviewModal }) => {
  if (!product) return null;

  const imageSource = product.image_url ? product.image_url : FALLBACK_IMAGE;

  // Mock reviews for now
  const mockReviews = [
    { id: 1, user: "Maria Santos", rating: 5, date: "Oct 12, 2023", text: "Absolutely in love with this scent! It lasts all day." },
    { id: 2, user: "John Cruz", rating: 5, date: "Sep 28, 2023", text: "Premium quality. Smells exactly like the original." },
    { id: 3, user: "Anna Reyes", rating: 4, date: "Sep 15, 2023", text: "Great fragrance, slightly sweeter than expected." }
  ];

  return (
    <div className="animate-fade-in w-full">
      <button onClick={onBack} className="flex items-center gap-2 text-gold-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={20} /> Back to Collection
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Image Section */}
        <div className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10 group">
          <img 
            src={imageSource} 
            alt={product.name} 
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          <button 
            onClick={() => onToggleWishlist(product)}
            className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 hover:border-red-500 hover:text-red-500 transition-colors z-20"
          >
            <Heart size={20} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
          </button>
        </div>

        {/* Info Section */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold tracking-widest text-gold-400 uppercase">{product.brand}</span>
            <span className="text-gray-600">•</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{product.size}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6 cursor-pointer" onClick={() => onOpenReviewModal(product)}>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < Math.floor(product.rating) ? "fill-gold-400 text-gold-400" : "fill-gray-700 text-gray-700"} />
              ))}
            </div>
            <span className="text-sm text-gray-400 hover:text-gold-400 transition-colors underline decoration-dashed underline-offset-4">{product.rating} ({mockReviews.length} Reviews)</span>
          </div>

          <p className="text-3xl font-light text-white mb-8">₱{product.price}</p>
          
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fragrance Notes</h3>
            <div className="flex flex-wrap gap-2">
              {product.notes?.map(note => (
                <span key={note} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
                  {note}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4 mb-10 pt-6 border-t border-white/10">
            {product.available ? (
              <div className="flex items-center gap-2 text-green-400">
                <Check size={18} /> <span className="text-sm font-medium">In Stock and ready to ship</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle size={18} /> <span className="text-sm font-medium">Currently Out of Stock</span>
              </div>
            )}
          </div>

          <button 
            disabled={!product.available}
            onClick={() => onAddToCart(product)}
            className={`w-full py-4 font-bold rounded flex items-center justify-center gap-2 transition-all shadow-lg text-lg
              ${product.available ? 'bg-gold-400 hover:bg-gold-300 text-rich-black shadow-gold-400/20 hover:shadow-gold-400/40' : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-80'}
            `}
          >
            {product.available ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;