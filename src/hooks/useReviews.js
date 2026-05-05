import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import { fetchReviewsAPI, submitReviewAPI, fetchPendingReviewsAPI, updateReviewStatusAPI } from '../services/reviewApi'; 
import { useAuth } from '../contexts/AuthContext';
import { logAdminActionAPI } from '../services/logApi';

export const useReviews = (productId, fallbackRating) => { 
  const queryClient = useQueryClient(); 
  const { user } = useAuth();

  const { data: reviews } = useQuery({ 
    queryKey: ['reviews', productId], 
    queryFn: () => fetchReviewsAPI(productId), 
    enabled: !!productId, 
  });

  const reviewList = reviews || [];
  
  // ✨ FIX: Strict tenths formatting on the frontend as well
  const averageRating = reviewList.length > 0 
    ? Math.round((reviewList.reduce((acc, curr) => acc + curr.rating, 0) / reviewList.length) * 10) / 10
    : (fallbackRating > 0 ? Math.round(fallbackRating * 10) / 10 : 0);

  const submitMutation = useMutation({ 
    mutationFn: ({ rating, comment, isAnonymous }) => submitReviewAPI(productId, user.id, rating, comment, isAnonymous), 
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] }); 
      queryClient.invalidateQueries({ queryKey: ['admin-pending-reviews'] }); 
    }, 
  });

  const submitNewReview = async (rating, comment, isAnonymous) => { 
    if (!user) throw new Error("Must be logged in to review."); 
    await submitMutation.mutateAsync({ rating, comment, isAnonymous }); 
  };

  const hasReviewed = user ? reviewList.some(r => r.user_id === user.id) : false; 
  const canReview = !!user && !hasReviewed;

  return { reviews: reviewList, averageRating, canReview, submitNewReview }; 
};

export const useAdminReviews = () => { 
  const queryClient = useQueryClient();
  const { user: adminUser } = useAuth(); 

  const { data: pendingReviews, isLoading } = useQuery({ 
    queryKey: ['admin-pending-reviews'], 
    queryFn: fetchPendingReviewsAPI, 
  });

  const updateStatusMutation = useMutation({ 
    mutationFn: ({ reviewId, status }) => updateReviewStatusAPI(reviewId, status), 
    onSuccess: (_, variables) => { 
      logAdminActionAPI(adminUser?.email, `Review ${variables.status}`, `Review ID: ${variables.reviewId}`);
      queryClient.invalidateQueries({ queryKey: ['admin-pending-reviews'] }); 
      queryClient.invalidateQueries({ queryKey: ['reviews'] }); 
    } 
  });

  const updateReviewStatus = async (reviewId, status) => { 
    await updateStatusMutation.mutateAsync({ reviewId, status }); 
  };

  return { pendingReviews, isLoading, updateReviewStatus }; 
};