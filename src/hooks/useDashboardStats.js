import { useState, useEffect } from 'react';
import { fetchDashboardStatsAPI } from '../services/statsApi';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({ inquiries: 0, revenue: 0, activeUsers: 0, outOfStock: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDashboardStatsAPI();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  return { stats, isLoading };
};