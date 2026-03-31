import { useState, useEffect, useCallback } from 'react';
import { fetchReviewsAPI, submitReviewAPI } from '../services/reviewApi';

export const useReviews = (productId, fallbackRating, user) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(fallbackRating || 5);

  const loadReviews = useCallback(async () => {
    if (!productId) return;
    
    try {
      const reviewData = await fetchReviewsAPI(productId);
      if (reviewData) {
        setReviews(reviewData);
        if (reviewData.length > 0) {
          const total = reviewData.reduce((acc, curr) => acc + curr.rating, 0);
          setAverageRating((total / reviewData.length).toFixed(1));
        } else {
          setAverageRating(fallbackRating || 5);
        }
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  }, [productId, fallbackRating]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const submitNewReview = async (rating, comment) => {
    if (!user) throw new Error("Must be logged in to review.");
    await submitReviewAPI(productId, user.id, rating, comment.trim());
    await loadReviews(); // Refresh reviews instantly
  };

  const hasReviewed = user ? reviews.some(review => review.user_id === user.id) : false;
  const canReview = user && !hasReviewed;

  return { reviews, averageRating, canReview, submitNewReview };
};