import { supabase } from './supabase';

export const fetchDashboardStatsAPI = async () => {
  // 1. Total Inquiries & Revenue
  const { data: orders } = await supabase.from('orders').select('total_amount, user_id');
  const totalRev = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
  
  // 2. Active Users
  const uniqueUsers = new Set(orders?.map(o => o.user_id)).size;

  // 3. Unavailable Products
  const { count: unavailableCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('available', false);

  return {
    inquiries: orders?.length || 0,
    revenue: totalRev,
    activeUsers: uniqueUsers,
    outOfStock: unavailableCount || 0
  };
};