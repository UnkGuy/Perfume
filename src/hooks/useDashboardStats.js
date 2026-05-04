import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStatsAPI } from '../services/statsApi';
import { useProducts } from './useAdminProducts';
import { useSettings } from '../contexts/SettingsContext';
import { useMemo } from 'react';

export const useDashboardStats = (days = 30) => {
  const { settings } = useSettings();
  const { products } = useProducts();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboardStats', days], // Refetch automatically when days change
    queryFn: () => fetchDashboardStatsAPI(days),
    staleTime: 1000 * 60 * 15,
  });

  const { dynamicUnavailableCount, dynamicLowStockProducts } = useMemo(() => {
    if (!products) return { dynamicUnavailableCount: 0, dynamicLowStockProducts: [] };
    const globalThreshold = settings?.inventory?.lowStockThreshold || 0;
    const lowStockVariants = [];
    let unavailableCount = 0;

    products.forEach(p => {
      // If the parent product is unavailable, count all its variants as unavailable
      if (p.available === false) {
        unavailableCount += (p.product_variants?.length || 1);
      }

      if (p.product_variants) {
        p.product_variants.forEach(v => {
          // Track low stock threshold items (Uses variant specific threshold, falls back to global)
          const currentThreshold = v.low_stock_threshold ?? globalThreshold;
          
          if (v.stock_count !== null && v.stock_count !== '' && v.stock_count <= currentThreshold) {
            lowStockVariants.push({
              ...v,
              products: { name: p.name, brand: p.brand }
            });
          }
          
          // If product IS available, but this specific variant has 0 stock, count it as unavailable
          if (p.available !== false && v.stock_count === 0) {
            unavailableCount++;
          }
        });
      }
    });

    return {
      dynamicUnavailableCount: unavailableCount,
      dynamicLowStockProducts: lowStockVariants
    };
  }, [products, settings?.inventory?.lowStockThreshold]);

  const stats = {
    ...(data || { pendingOrders: 0, unreadMessages: 0, pendingReviews: 0, revenue: 0, activeUsers: 0 }),
    outOfStock: dynamicUnavailableCount, 
    lowStockProducts: dynamicLowStockProducts
  };

  return { stats, isLoading, refetch };
};