import React, { useState, useEffect } from 'react';
import { Star, ArrowLeft, Heart, Check, AlertCircle, Edit3, User as UserIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ReviewModal from './ReviewModal';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const ProductDetails = ({ product, onBack, onAddToCart, onToggleWishlist, isInWishlist, showToast }) => {
  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [averageRating, setAverageRating] = useState(product?.rating || 5);
  
  // --- BULLETPROOF USER STATE ---
  const [currentUser, setCurrentUser] = useState(null);

  const imageSource = product?.image_url ? product.image_url : FALLBACK_IMAGE;

  // --- DATABASE LOGIC ---
  const fetchReviewsData = async () => {
    if (!product) return;

    // 1. Fetch the user directly from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const loggedInUser = session?.user || null;
    setCurrentUser(loggedInUser);

    // 2. Fetch real reviews 
    const { data: reviewData, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return;
    }

    if (reviewData) {
      setReviews(reviewData);
      
      // Calculate dynamic average rating
      if (reviewData.length > 0) {
        const total = reviewData.reduce((acc, curr) => acc + curr.rating, 0);
        setAverageRating((total / reviewData.length).toFixed(1));
      } else {
        setAverageRating(product.rating || 5);
      }
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, [product]);

  if (!product) return null;

  // --- ANTI-SPAM LOGIC ---
  const hasReviewed = currentUser ? reviews.some(review => review.user_id === currentUser.id) : false;
  const canReview = currentUser && !hasReviewed;

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto">
      
      {/* Review Modal */}
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        product={product} 
        user={currentUser} 
        showToast={showToast}
        onReviewSubmitted={fetchReviewsData} 
      />

      <button onClick={onBack} className="flex items-center gap-2 text-gold-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={20} /> Back to Collection
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        
        {/* Left: Image */}
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

        {/* Right: Info Section */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold tracking-widest text-gold-400 uppercase">{product.brand}</span>
            <span className="text-gray-600">•</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{product.size}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{product.name}</h1>
          
          {/* Dynamic Ratings & Review Button */}
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
            
            {hasReviewed && (
              <span className="text-xs text-gray-500 mt-2 block italic">
                You have already reviewed this product.
              </span>
            )}
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

      {/* --- REVIEWS LIST SECTION --- */}
      <div id="reviews-section" className="pt-12 border-t border-white/10">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          Customer Reviews 
          <span className="text-sm font-normal text-gray-500 bg-white/5 px-3 py-1 rounded-full">{reviews.length}</span>
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
                      {/* Scrubbed the 'Verified' text - it just says Customer now */}
                      <p className="font-bold text-white text-sm">
                        Customer
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
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