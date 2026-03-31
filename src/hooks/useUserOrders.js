import { useQuery } from '@tanstack/react-query';
import { fetchUserOrdersAPI } from '../services/orderApi';

export const useUserOrders = (userId) => {
  const { data, isLoading } = useQuery({
    // Create a unique cache just for this specific user
    queryKey: ['userOrders', userId],
    queryFn: () => fetchUserOrdersAPI(userId),
    // Only run this query if a userId actually exists
    enabled: !!userId,
  });

  return { 
    orderHistory: data || [], 
    isLoading 
  };
};