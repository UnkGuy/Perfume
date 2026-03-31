import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStatsAPI } from '../services/statsApi';

export const useDashboardStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStatsAPI,
    staleTime: 1000 * 60 * 15, // Cache these heavy calculations for 15 minutes
  });

  return { 
    stats: data || { inquiries: 0, revenue: 0, activeUsers: 0, outOfStock: 0 }, 
    isLoading 
  };
};