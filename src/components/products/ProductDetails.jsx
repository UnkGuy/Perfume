import React, { useState } from 'react';
import { Star, ArrowLeft, Heart, Check, AlertCircle } from 'lucide-react';
import perfumeImage from '../../assets/images/perfume.jpg';

const ProductDetails = ({ 
  product, 
  onBack, 
  onAddToCart, 
  onToggleWishlist, 
  isInWishlist, 
  onOpenReviewModal 
}) => {
  
  if (!product) return null;

  // Mock reviews for the details view
  const mockReviews = [
    { id: 1, user: "Maria Santos", rating: 5, date: "Oct 12, 2023", text: "Absolutely in love with this scent! It lasts all day." },
    { id: 2, user: "John Cruz", rating: 5, date: "Sep 28, 2023", text: "Premium quality. Smells exactly like the original." },
    { id: 3, user: "Anna Reyes", rating: 4, date: "Sep 15, 2023", text: "Great fragrance, slightly sweeter than expected." }
  ];

  return (
    <div className="animate-fade-in w-full">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-gold-400 mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Products
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Left: Image */}
        <div className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10 group">
          <img 
            src={perfumeImage} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
           {/* Mobile Wishlist Button (Visible only on small screens usually, but kept for access) */}
           <button 
              onClick={() => onToggleWishlist(product)}
              className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 hover:border-red-500 hover:text-red-500 transition-colors z-20"
            >
              <Heart size={20} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
            </button>
        </div>
        
        {/* Right: Info */}
        <div className="flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gold-400 tracking-widest uppercase text-sm font-bold">{product.brand}</span>
            {/* Desktop Wishlist Button */}
            <div className="flex items-center gap-2">
               {product.available ? (
                 <span className="flex items-center gap-1 text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded">
                   <Check size={12} /> In Stock
                 </span>
               ) : (
                 <span className="flex items-center gap-1 text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded">
                   <AlertCircle size={12} /> Out of Stock
                 </span>
               )}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{product.name}</h1>
          
          {/* Rating Row */}
          <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                  <span className="font-bold text-gold-400 text-xl">{product.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={18} className={idx < Math.round(product.rating) ? "fill-gold-400 text-gold-400" : "text-gray-600"} />
                    ))}
                  </div>
              </div>
              <span className="text-gray-500 border-l border-gray-700 pl-4">{mockReviews.length} Reviews</span>
          </div>

          <p className="text-3xl font-light text-white mb-8">₱{product.price}</p>
          
          <p className="text-gray-400 leading-relaxed mb-8 text-lg">
            Experience the essence of luxury with {product.name}. 
            Crafted with precision, this fragrance combines the finest <span className="text-gold-200">{product.notes[0]}</span> 
            notes with subtle hints of <span className="text-gold-200">{product.notes[1]}</span>. 
            A scent that defines elegance.
          </p>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Fragrance Notes</h3>
            <div className="flex flex-wrap gap-2">
              {product.notes.map(note => (
                <span key={note} className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 hover:border-gold-400/50 transition-colors cursor-default">
                  {note}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
              <button 
                disabled={!product.available}
                onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                className={`flex-[2] px-8 py-4 font-bold rounded transition-all w-full shadow-lg
                  ${product.available 
                    ? 'bg-gold-400 hover:bg-gold-300 text-rich-black shadow-gold-400/20' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
              >
                {product.available ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenReviewModal(product); }}
                className="flex-1 px-6 py-4 border border-gold-400/50 text-gold-400 hover:bg-gold-400/10 font-bold rounded transition-all flex items-center justify-center gap-2"
              >
                <Star size={18} /> Review
              </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="border-t border-white/10 pt-12 mt-12">
        <h3 className="text-2xl font-bold text-white mb-8">Customer Reviews</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockReviews.map((review) => (
            <div key={review.id} className="bg-white/5 border border-white/5 p-6 rounded-xl hover:border-white/20 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center font-bold">
                    {review.user.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{review.user}</p>
                    <span className="text-xs text-green-400 flex items-center gap-1">Verified Buyer</span>
                  </div>
                </div>
                <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < review.rating ? "fill-gold-400 text-gold-400" : "text-gray-700"} />
                    ))}
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">"{review.text}"</p>
              <p className="text-xs text-gray-600 mt-4">{review.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;