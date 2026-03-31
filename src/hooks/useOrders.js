import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrdersAPI, updateOrderStatusAPI } from '../services/orderApi';

export const useOrders = (showToast) => {
  const queryClient = useQueryClient();

  // 1. Fetch the data
  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: fetchOrdersAPI,
  });

  // 2. Setup the mutation to change status
  const statusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }) => updateOrderStatusAPI(orderId, newStatus),
    onSuccess: (_, variables) => {
      // Refresh the table instantly!
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      if (showToast) showToast('Success', `Order #${variables.orderId} updated to ${variables.newStatus}`);
    },
    onError: () => {
      if (showToast) showToast('Error', 'Failed to update status', 'error');
    }
  });

  // 3. The function we expose to the UI
  const changeOrderStatus = async (orderId, newStatus) => {
    await statusMutation.mutateAsync({ orderId, newStatus });
  };

  return { 
    orders: orders || [], 
    isLoading, 
    changeOrderStatus 
  };
};