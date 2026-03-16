import { useState, useEffect, useCallback } from 'react';
import { fetchOrdersAPI, updateOrderStatusAPI } from '../services/orderApi';

export const useOrders = (showToast) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchOrdersAPI();
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      if (showToast) showToast('Error', 'Could not load orders.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const changeOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatusAPI(orderId, newStatus);
      
      // Optimistic Update: Update the local state instantly without refetching from DB
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      if (showToast) showToast('Success', `Order #${orderId} marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error', 'Failed to update status', 'error');
    }
  };

  return { orders, isLoading, changeOrderStatus };
};