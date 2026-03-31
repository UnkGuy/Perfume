import React, { useState } from 'react';
import { Star, ArrowLeft, Heart, Check, AlertCircle, Edit3, User as UserIcon } from 'lucide-react';
import ReviewModal from './ReviewModal';
import { useReviews } from '../../hooks/useReviews'; // <-- IMPORT THE HOOK

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const ProductDetails = ({ product, onBack, onAddToCart, onToggleWishlist, isInWishlist, showToast, user, setCurrentPage }) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Grab EVERYTHING from our new hook!
  const { reviews, averageRating, canReview, submitNewReview } = useReviews(product?.id, product?.rating, user);

  const images = product?.image_urls?.length > 0 ? product.image_urls : [FALLBACK_IMAGE];

  const isDiscounted = product?.compare_at_price && product.compare_at_price > product.price;
  const percentOff = isDiscounted ? Math.round((1 - (product.price / product.compare_at_price)) * 100) : 0;

  if (!product) return null;

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto">
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        product={product} 
        submitNewReview={submitNewReview} // <-- PASS DOWN THE HOOK'S FUNCTION
        showToast={showToast}
      />

      <button onClick={onBack} className="flex items-center gap-2 text-gold-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={20} /> Back to Collection
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10 group">
            <img src={images[activeImageIndex]} alt={product.name} className="w-full h-full object-cover transition-opacity duration-300" />
            {isDiscounted && (
              <span className="absolute top-4 left-4 bg-gold-400 text-black text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-lg">Sale</span>
            )}
            <button 
              onClick={() => onToggleWishlist(product)}
              className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 hover:border-red-500 hover:text-red-500 transition-colors z-20"
            >
              <Heart size={20} className={isInWishlist ? "fill-red-500 text-red-500" : ""} />
            </button>
          </div>

          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {images.map((img, idx) => (
                <button 
                  key={idx} onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${activeImageIndex === idx ? 'border-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-white/10 hover:border-gold-400/50 opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold tracking-widest text-gold-400 uppercase">{product.brand}</span>
            <span className="text-gray-600">•</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{product.size}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{product.name}</h1>
          
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(averageRating) ? "fill-gold-400 text-gold-400" : "fill-gray-700 text-gray-700"} />
                ))}
              </div>
              <span className="text-sm text-gray-400 hover:text-gold-400 transition-colors cursor-pointer" onClick={() => document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' })}>
                {averageRating} ({reviews.length} Reviews)
              </span>
            </div>

            {canReview && (
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-gold-400/10 text-gold-400 border border-gold-400/20 rounded-md hover:bg-gold-400 hover:text-black transition-all mt-2 font-medium"
              >
                <Edit3 size={14} /> Write a Review
              </button>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-4">
              <p className="text-3xl font-light text-white">₱{product.price}</p>
              {isDiscounted && (
                <>
                  <p className="text-xl text-gray-500 line-through">₱{product.compare_at_price}</p>
                  <span className="px-2 py-1 bg-gold-400/10 text-gold-400 border border-gold-400/30 text-xs font-bold rounded tracking-wide">{percentOff}% OFF</span>
                </>
              )}
            </div>
          </div>

          {product.description && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">About the Scent</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
          
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fragrance Notes</h3>
            <div className="flex flex-wrap gap-2">
              {product.notes?.map(note => (
                <span key={note} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">{note}</span>
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
            onClick={() => {
              if (!user) {
                if (showToast) showToast("Login Required", "Please sign in to add items to your cart.", "error");
                setCurrentPage('login');
                return;
              }
              onAddToCart(product);
            }}
            className={`w-full py-4 font-bold rounded flex items-center justify-center gap-2 transition-all shadow-lg text-lg ${product.available ? 'bg-gold-400 hover:bg-gold-300 text-rich-black shadow-gold-400/20 hover:shadow-gold-400/40' : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-80'}`}
          >
            {product.available ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
      
      <div id="reviews-section" className="pt-12 border-t border-white/10">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          Customer Reviews <span className="text-sm font-normal text-gray-500 bg-white/5 px-3 py-1 rounded-full">{reviews.length}</span>
        </h2>
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
            <Star size={32} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center border border-gold-400/30 uppercase font-bold">
                      <UserIcon size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Customer</p>
                      <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? "fill-gold-400 text-gold-400" : "fill-gray-700 text-gray-700"} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">"{review.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;