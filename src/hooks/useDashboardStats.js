import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStatsAPI } from '../services/statsApi';
import { useProducts } from './useAdminProducts';
import { useSettings } from '../contexts/SettingsContext';
import { useMemo } from 'react';

export const useDashboardStats = () => {
  const { settings } = useSettings();
  const { products } = useProducts();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStatsAPI,
    staleTime: 1000 * 60 * 15,
  });

  const { dynamicOutOfStock, dynamicLowStockProducts } = useMemo(() => {
    if (!products) return { dynamicOutOfStock: 0, dynamicLowStockProducts: [] };
    const threshold = settings?.inventory?.lowStockThreshold || 0;
    const lowStockVariants = [];

    products.forEach(p => {
      if (p.product_variants) {
        p.product_variants.forEach(v => {
          // Ignores completely blank/null items (interpreted as infinite stock)
          if (v.stock_count !== null && v.stock_count !== '' && v.stock_count <= threshold) {
            lowStockVariants.push({
              ...v,
              products: { name: p.name, brand: p.brand }
            });
          }
        });
      }
    });

    return {
      dynamicOutOfStock: lowStockVariants.length,
      dynamicLowStockProducts: lowStockVariants
    };
  }, [products, settings?.inventory?.lowStockThreshold]);

  const stats = {
    ...(data || { inquiries: 0, revenue: 0, activeUsers: 0 }),
    outOfStock: dynamicOutOfStock, 
    lowStockProducts: dynamicLowStockProducts
  };

  return { stats, isLoading };
};