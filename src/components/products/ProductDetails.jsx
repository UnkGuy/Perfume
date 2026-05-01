import React, { useState, useEffect } from 'react';
import { Star, ArrowLeft, Heart, Check, AlertCircle, Edit3, User as UserIcon } from 'lucide-react';
import ReviewModal from './ReviewModal';
import SuggestedProducts from '../common/SuggestedProducts';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '../../contexts/AuthContext';
import { useShop } from '../../contexts/ShopContext';
import { useUI } from '../../contexts/UIContext';

const FALLBACK_IMAGE = 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/product-images/test.jpg';

const maskEmail = (email) => {
  if (!email) return 'User';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [name, domain] = parts;
  if (name.length <= 2) return `${name[0]}***@${domain}`;
  const first = name.slice(0, 2);
  const last = name.slice(-1);
  return `${first}***${last}@${domain}`;
};

const ProductDetails = ({ product, onBack, onSelect, onQuickView }) => {
  const { user, userRole } = useAuth();
  const { addToCart, toggleWishlist, wishlistItems, showToast } = useShop();
  const { setCurrentPage } = useUI();

  const variants = product?.product_variants || [];
  const [selectedVariant, setSelectedVariant] = useState(variants.length > 0 ? variants[0] : null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex]   = useState(0);

  const { reviews, averageRating, canReview, hasPurchased, submitNewReview } = useReviews(product?.id, product?.rating);
  const isInWishlist = wishlistItems?.some(item => item.id === product?.id);

  const displayPrice = selectedVariant?.price || 0;
  const displayCompare = selectedVariant?.compare_at_price;
  const displaySize = selectedVariant?.size || 'Standard';
  const displayStock = selectedVariant?.stock_count;
  
  const defaultImages = product?.image_urls?.length > 0 ? product.image_urls : [FALLBACK_IMAGE];
  const mainImage = selectedVariant?.image_url || defaultImages[activeImageIndex];

  const isDiscounted = displayCompare && displayCompare > displayPrice;
  const percentOff = isDiscounted ? Math.round((1 - displayPrice / displayCompare) * 100) : 0;
  const isAvailable = product?.available && (displayStock === null || displayStock > 0);
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveImageIndex(0);
    if(product?.product_variants?.length > 0) setSelectedVariant(product.product_variants[0]);
  }, [product]);

  if (!product) return null;

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto px-4 md:px-0 overflow-hidden">
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} product={product} submitNewReview={submitNewReview} showToast={showToast} hasPurchased={hasPurchased} />
      <button onClick={onBack} className="flex items-center gap-2 text-gold-400 hover:text-white mb-6 md:mb-8 transition-colors text-sm md:text-base"><ArrowLeft size={18} /> Back to Collection</button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16 w-full">
        <div className="flex flex-col gap-4 w-full">
          <div className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10 group w-full">
            <img src={mainImage} alt={product.name} className="w-full h-full object-cover transition-opacity duration-300" />
            {isDiscounted && <span className="absolute top-4 left-4 bg-gold-400 text-black text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-lg">Sale</span>}
            <button onClick={() => toggleWishlist(product)} className="absolute top-4 right-4 p-3 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 hover:border-red-500 hover:text-red-500 transition-colors z-20">
              <Heart size={20} className={isInWishlist ? 'fill-red-500 text-red-500' : ''} />
            </button>
          </div>
          {defaultImages.length > 1 && (
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 custom-scrollbar w-full">
              {defaultImages.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${activeImageIndex === idx ? 'border-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-white/10 hover:border-gold-400/50 opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center w-full min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold tracking-widest text-gold-400 uppercase truncate max-w-full">{product.brand}</span>
            <span className="text-gray-600">•</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider truncate max-w-[100px]">{displaySize}</span>
            <span className="text-gray-600">•</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider truncate max-w-[100px]">{product.gender || 'Unisex'}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 break-words hyphens-auto w-full">{product.name}</h1>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="flex gap-1">{[...Array(5)].map((_, i) => ( <Star key={i} size={16} className={i < Math.floor(averageRating) ? 'fill-gold-400 text-gold-400' : 'fill-gray-700 text-gray-700'} /> ))}</div>
              <span className="text-sm text-gray-400 hover:text-gold-400 transition-colors cursor-pointer" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>
                {averageRating > 0 ? averageRating : 'No reviews yet'} ({reviews.length} Reviews)
              </span>
            </div>
          </div>

          {variants.length > 1 && (
            <div className="mb-6 w-full">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {variants.map(v => (
                  <button key={v.id} onClick={() => setSelectedVariant(v)} className={`px-4 py-2 border rounded text-sm transition-all ${selectedVariant?.id === v.id ? 'border-gold-400 bg-gold-400/10 text-gold-400' : 'border-white/10 text-gray-400 hover:border-gold-400/50'}`}>
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8 w-full flex-wrap">
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-3xl font-light text-white truncate max-w-full">₱{displayPrice.toLocaleString()}</p>
              {isDiscounted && (
                <><p className="text-xl text-gray-500 line-through truncate max-w-full">₱{displayCompare.toLocaleString()}</p><span className="px-2 py-1 bg-gold-400/10 text-gold-400 border border-gold-400/30 text-xs font-bold rounded tracking-wide whitespace-nowrap">{percentOff}% OFF</span></>
              )}
            </div>
          </div>

          {product.description && (
            <div className="mb-8 w-full">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">About the Scent</h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">{product.description}</p>
            </div>
          )}

          <div className="space-y-4 mb-8 w-full">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fragrance Notes</h3>
            <div className="flex flex-wrap gap-2">
              {product.notes?.map(note => <span key={note} className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 border border-white/10 rounded-full text-xs md:text-sm text-gray-300 break-words">{note}</span>)}
            </div>
          </div>

          <div className="space-y-4 mb-10 pt-6 border-t border-white/10 w-full">
            {isAvailable ? <div className="flex items-center gap-2 text-green-400"><Check size={18} className="flex-shrink-0"/><span className="text-sm font-medium">In Stock and ready to ship</span></div> : <div className="flex items-center gap-2 text-red-400"><AlertCircle size={18} className="flex-shrink-0"/><span className="text-sm font-medium">Currently Out of Stock</span></div>}
          </div>

          <button
            disabled={!isAvailable || isAdmin}
            onClick={() => {
              if (!user) {
                if (showToast) showToast('Login Required', 'Please sign in to add items to your cart.', 'error');
                setCurrentPage('login');
                return;
              }
              addToCart({ 
                ...product, 
                price: displayPrice, 
                size: displaySize, 
                image_urls: [mainImage], 
                variant_id: selectedVariant?.id,
                stock_count: displayStock
              });
            }}
            className={`w-full py-4 font-bold rounded flex items-center justify-center gap-2 transition-all shadow-lg text-base md:text-lg ${isAvailable && !isAdmin ? 'bg-gold-400 hover:bg-gold-300 text-rich-black' : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-80'}`}
          >
            {isAdmin ? 'Admins Cannot Purchase' : (isAvailable ? 'Add to Cart' : 'Out of Stock')}
          </button>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div id="reviews-section" className="mt-16 pt-16 border-t border-white/10 w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Customer Reviews</h2>
        
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 w-full max-w-3xl mx-auto px-4">
            <Star size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl text-white font-medium mb-2">No reviews yet</h3>
            <p className="text-sm md:text-base text-gray-400">Be the first to share your thoughts on {product.name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto">
            {reviews.map(review => {
              let displayComment = review.comment || '';
              let isAnon = false;
              if (displayComment.startsWith('[ANON]')) {
                isAnon = true;
                displayComment = displayComment.replace('[ANON]', '');
              }
              const reviewerName = isAnon ? 'Anonymous' : maskEmail(review.profiles?.email);

              return (
                <div key={review.id} className="bg-white/5 p-6 rounded-xl border border-white/10 w-full min-w-0">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < review.rating ? 'fill-gold-400 text-gold-400' : 'fill-gray-700 text-gray-700'} />
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed break-words">{displayComment}</p>
                  <div className="mt-4 pt-4 border-t border-white/10 text-xs text-gray-500 flex justify-between items-center">
                    <span className="flex items-center gap-1.5"><UserIcon size={12} /> {reviewerName}</span>
                    <span>Posted on {new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {canReview && (
          <div className="flex justify-center mt-12 w-full px-4">
            <button 
              onClick={() => setIsReviewModalOpen(true)} 
              className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-gold-400 text-black font-bold text-sm sm:text-lg tracking-wider uppercase rounded hover:bg-gold-300 transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)] flex justify-center items-center gap-3"
            >
              <Edit3 size={24} /> Write a Review
            </button>
          </div>
        )}
      </div>

      <div className="mt-24 w-full">
        <SuggestedProducts currentProductId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetails;