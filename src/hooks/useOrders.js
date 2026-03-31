import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrdersAPI, updateOrderStatusAPI } from '../services/orderApi';
import { logAdminActionAPI } from '../services/logApi'; // <-- 1. IMPORT LOG API
import { useAuth } from '../contexts/AuthContext'; // <-- 2. IMPORT AUTH TO GET ADMIN EMAIL

export const useOrders = (showToast) => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get the logged-in admin!

  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: fetchOrdersAPI,
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }) => updateOrderStatusAPI(orderId, newStatus),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      if (showToast) showToast('Success', `Order #${variables.orderId} updated to ${variables.newStatus}`);
      
      // <-- 3. LOG THE ACTION IN THE BACKGROUND -->
      logAdminActionAPI(
        user?.email, 
        `Updated Order Status to ${variables.newStatus}`, 
        `Order #${variables.orderId}`
      );
    },
    onError: () => {
      if (showToast) showToast('Error', 'Failed to update status', 'error');
    }
  });

  const changeOrderStatus = async (orderId, newStatus) => {
    await statusMutation.mutateAsync({ orderId, newStatus });
  };

  return { orders: orders || [], isLoading, changeOrderStatus };
};