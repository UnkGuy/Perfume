import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrdersAPI, updateOrderStatusAPI } from '../services/orderApi';
import { sendMessageAPI } from '../services/messageApi';
import { logAdminActionAPI } from '../services/logApi';
import { useAuth } from '../contexts/AuthContext';

const STATUS_MESSAGES = {
  shipped: (orderId) =>
    `📦 Your order #${orderId} has been marked as shipped! We'll be in touch with delivery details shortly. Thank you for shopping with KL Scents! 🌟`,
  completed: (orderId) =>
    `✅ Your order #${orderId} has been completed. We hope you love your new scent! Feel free to leave a review. 💛`,
};

export const useOrders = (showToast) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: fetchOrdersAPI,
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }) => updateOrderStatusAPI(orderId, newStatus),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      if (showToast) showToast('Success', `Order #${variables.orderId} updated to ${variables.newStatus}`);

      logAdminActionAPI(
        user?.email,
        `Updated Order Status to ${variables.newStatus}`,
        `Order #${variables.orderId}`
      );

      // Auto-notify the customer via chat if status is a meaningful milestone
      const messageTemplate = STATUS_MESSAGES[variables.newStatus];
      if (messageTemplate && variables.orderUserId) {
        try {
          await sendMessageAPI({
            sender_role: 'admin',
            content: messageTemplate(variables.orderId),
            user_id: variables.orderUserId,
          });
        } catch (err) {
          // Don't fail the status update just because the notification failed
          console.warn('Status notification message failed:', err);
        }
      }
    },
    onError: () => {
      if (showToast) showToast('Error', 'Failed to update status', 'error');
    },
  });

  // ← orderUserId passed through so the mutation can notify the right user
  const changeOrderStatus = async (orderId, newStatus, orderUserId) => {
    await statusMutation.mutateAsync({ orderId, newStatus, orderUserId });
  };

  return { orders: orders || [], isLoading, changeOrderStatus };
};