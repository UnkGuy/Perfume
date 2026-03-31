import { useState, useEffect } from 'react';
import { fetchUserOrdersAPI } from '../services/orderApi';

export const useUserOrders = (userId) => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const data = await fetchUserOrdersAPI(userId);
        setOrderHistory(data || []);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [userId]);

  return { orderHistory, isLoading };
};