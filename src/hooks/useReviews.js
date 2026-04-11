import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReviewsAPI, submitReviewAPI, checkUserPurchasedAPI } from '../services/reviewApi';
import { useAuth } from '../contexts/AuthContext';

export const useReviews = (productId, fallbackRating) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: reviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchReviewsAPI(productId),
    enabled: !!productId,
  });

  // ← NEW: check whether this user has actually bought the product
  const { data: hasPurchased } = useQuery({
    queryKey: ['userPurchased', user?.id, productId],
    queryFn: () => checkUserPurchasedAPI(user.id, productId),
    enabled: !!user && !!productId,
    staleTime: 1000 * 60 * 10, // stable for 10 min — purchases don't change often
  });

  const reviewList = reviews || [];

  const averageRating = reviewList.length > 0
    ? (reviewList.reduce((acc, curr) => acc + curr.rating, 0) / reviewList.length).toFixed(1)
    : (fallbackRating || 5);

  const submitMutation = useMutation({
    mutationFn: ({ rating, comment }) => submitReviewAPI(productId, user.id, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
    },
  });

  const submitNewReview = async (rating, comment) => {
    if (!user) throw new Error("Must be logged in to review.");
    if (!hasPurchased) throw new Error("You can only review products you've purchased.");
    await submitMutation.mutateAsync({ rating, comment });
  };

  const hasReviewed = user ? reviewList.some(r => r.user_id === user.id) : false;

  // canReview: logged in + bought the product + hasn't already reviewed it
  const canReview = !!user && !!hasPurchased && !hasReviewed;

  return {
    reviews: reviewList,
    averageRating,
    canReview,
    hasPurchased: !!hasPurchased,
    submitNewReview,
  };
};