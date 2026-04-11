import React, { useState } from 'react';
import { Star, X, Loader2, ShoppingBag } from 'lucide-react';

const MAX_COMMENT = 1000;

const ReviewModal = ({ isOpen, onClose, product, submitNewReview, showToast, hasPurchased }) => {
  const [rating, setRating]         = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]           = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (comment.length > MAX_COMMENT) { setError(`Comment must be ${MAX_COMMENT} characters or fewer.`); return; }

    setIsSubmitting(true);
    try {
      await submitNewReview(rating, comment);
      if (showToast) showToast('Success', 'Your review has been published!');
      onClose();
    } catch (err) {
      if (err.code === '23505') {
        setError('You have already reviewed this product.');
      } else {
        setError(err.message || 'Something went wrong.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ← If user hasn't purchased, show a friendly gate instead of the form
  if (!hasPurchased) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="bg-rich-black border border-gold-400/30 rounded-2xl max-w-md w-full relative shadow-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
          <button className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors" onClick={onClose}>
            <X size={24} />
          </button>
          <div className="w-16 h-16 rounded-full bg-gold-400/10 flex items-center justify-center mx-auto mb-4 border border-gold-400/20">
            <ShoppingBag size={28} className="text-gold-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Purchase Required</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Reviews are only available to verified buyers. Order <span className="text-gold-400">{product.name}</span> first, then share your experience!
          </p>
          <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold rounded-lg transition-colors text-sm">
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-rich-black border border-gold-400/30 rounded-2xl max-w-lg w-full relative shadow-2xl flex flex-col p-6 sm:p-8" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 z-10 text-gray-500 hover:text-white transition-colors" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Write a Review</h2>
        <p className="text-sm text-gray-400 mb-6">
          Tell others about your experience with <span className="text-gold-400">{product.name}</span>.
        </p>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-gray-400 uppercase tracking-widest">Overall Rating</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star size={32} className={`transition-colors duration-200 ${(hoverRating || rating) >= star ? 'fill-gold-400 text-gold-400' : 'text-gray-600'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-400 uppercase tracking-widest">Your Review</label>
              <span className={`text-xs ${comment.length > MAX_COMMENT * 0.9 ? 'text-red-400' : 'text-gray-600'}`}>
                {comment.length}/{MAX_COMMENT}
              </span>
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={MAX_COMMENT}
              placeholder="What did you like or dislike? How long did the scent last?"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors resize-none h-32"
            />
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full py-4 mt-2 bg-gold-400 hover:bg-gold-300 text-rich-black font-bold tracking-widest uppercase rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isSubmitting && <Loader2 className="animate-spin" size={18} />}
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;