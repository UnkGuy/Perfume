import React, { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase';

const ReviewModal = ({ isOpen, onClose, product, user, onReviewSubmitted, showToast }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !product || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: submitError } = await supabase
        .from('reviews')
        .insert([{
          product_id: product.id,
          user_id: user.id,
          rating: rating,
          comment: comment.trim()
        }]);

      if (submitError) {
        // Handle the unique constraint error if they already reviewed it
        if (submitError.code === '23505') {
          throw new Error('You have already reviewed this product.');
        }
        throw submitError;
      }

      if (showToast) showToast('Success', 'Your review has been published!');
      onReviewSubmitted(); // Tell the parent component to refresh the reviews!
      onClose(); // Close the modal
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-rich-black border border-gold-400/30 rounded-2xl max-w-lg w-full relative shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8" 
        onClick={e => e.stopPropagation()}
      >
        <button className="absolute top-4 right-4 z-10 text-gray-500 hover:text-white transition-colors" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Write a Review</h2>
        <p className="text-sm text-gray-400 mb-6">Tell others about your experience with <span className="text-gold-400">{product.name}</span>.</p>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Interactive Star Rating */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-gray-400 uppercase tracking-widest">Overall Rating</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    size={32} 
                    className={`transition-colors duration-200 ${(hoverRating || rating) >= star ? 'fill-gold-400 text-gold-400' : 'text-gray-600'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 uppercase tracking-widest">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? How long did the scent last?"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold-400 transition-colors resize-none h-32"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
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