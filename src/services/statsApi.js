import { supabase } from './supabase';

export const fetchDashboardStatsAPI = async () => {
  // 1. Fetch Top-Level Numbers
  const { count: inquiries } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  const { data: revData } = await supabase.from('orders').select('total_amount');
  const revenue = revData?.reduce((acc, curr) => acc + curr.total_amount, 0) || 0;
  const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: outOfStock } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('available', false);

  // 2. Fetch Chart Data (Last 30 Days Revenue)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('created_at, total_amount')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  // 3. Group the orders by day for the chart
  const chartDataMap = {};
  recentOrders?.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!chartDataMap[date]) chartDataMap[date] = 0;
    chartDataMap[date] += order.total_amount;
  });

  // Convert map to an array for Recharts
  const chartData = Object.keys(chartDataMap).map(date => ({
    name: date,
    revenue: chartDataMap[date]
  }));

  return { inquiries: inquiries || 0, revenue, activeUsers: activeUsers || 0, outOfStock: outOfStock || 0, chartData };
};