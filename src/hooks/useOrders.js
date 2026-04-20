import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrdersAPI, updateOrderStatusAPI, updateOrderDetailsAPI } from '../services/orderApi';
import { sendMessageAPI } from '../services/messageApi';
import { logAdminActionAPI } from '../services/logApi';
import { useAuth } from '../contexts/AuthContext';

const STATUS_MESSAGES = {
  shipped: (orderId) => `📦 Your order #${orderId} has been marked as shipped! We'll be in touch with delivery details shortly.`,
  completed: (orderId) => `✅ Your order #${orderId} has been completed. We hope you love your new scent!`,
  canceled: (orderId) => `❌ Your order #${orderId} has been canceled. Please reply if you have questions.`,
};

export const useOrders = (showToast) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: fetchOrdersAPI,
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, newStatus, orderItems }) => updateOrderStatusAPI(orderId, newStatus, orderItems),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      if (showToast) showToast('Success', `Order #${variables.orderId} updated to ${variables.newStatus}`);
      logAdminActionAPI(user?.email, `Updated Order Status to ${variables.newStatus}`, `Order #${variables.orderId}`);
      
      const messageTemplate = STATUS_MESSAGES[variables.newStatus];
      if (messageTemplate && variables.orderUserId) {
        try { await sendMessageAPI({ sender_role: 'admin', content: messageTemplate(variables.orderId), user_id: variables.orderUserId }); } 
        catch (err) { console.warn('Notification failed:', err); }
      }
    }
  });

  const editOrderMutation = useMutation({
    mutationFn: ({ orderId, newTotal, updatedMetadata }) => updateOrderDetailsAPI(orderId, newTotal, updatedMetadata),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      if (showToast) showToast('Success', `Order #${variables.orderId} successfully modified.`);
      logAdminActionAPI(user?.email, `Modified Order Details`, `Order #${variables.orderId}`);
    }
  });

  const changeOrderStatus = async (orderId, newStatus, orderUserId, orderItems = []) => {
    await statusMutation.mutateAsync({ orderId, newStatus, orderUserId, orderItems });
  };

  const modifyOrder = async (orderId, newTotal, updatedMetadata) => {
    await editOrderMutation.mutateAsync({ orderId, newTotal, updatedMetadata });
  };

  return { orders: orders || [], isLoading, changeOrderStatus, modifyOrder };
};