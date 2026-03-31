import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReviewsAPI, submitReviewAPI } from '../services/reviewApi';

export const useReviews = (productId, fallbackRating, user) => {
  const queryClient = useQueryClient();

  // 1. Fetch reviews for this specific product
  const { data: reviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchReviewsAPI(productId),
    enabled: !!productId,
  });

  const reviewList = reviews || [];
  
  // 2. Automatically calculate average rating
  const averageRating = reviewList.length > 0 
    ? (reviewList.reduce((acc, curr) => acc + curr.rating, 0) / reviewList.length).toFixed(1)
    : (fallbackRating || 5);

  // 3. Setup the mutation to post a new review
  const submitMutation = useMutation({
    mutationFn: ({ rating, comment }) => submitReviewAPI(productId, user.id, rating, comment),
    onSuccess: () => {
      // Invalidate just THIS product's reviews to refresh the list below the product
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    }
  });

  const submitNewReview = async (rating, comment) => {
    if (!user) throw new Error("Must be logged in to review.");
    await submitMutation.mutateAsync({ rating, comment });
  };

  const hasReviewed = user ? reviewList.some(r => r.user_id === user.id) : false;
  const canReview = user && !hasReviewed;

  return { 
    reviews: reviewList, 
    averageRating, 
    canReview, 
    submitNewReview 
  };
};