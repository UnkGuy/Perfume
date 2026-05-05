// FILE: src/services/statsApi.js
import { supabase } from './supabase';

export const fetchDashboardStatsAPI = async (days = 30) => {
  // Calculate the date cutoff if not 'all'
  let dateLimit = null;
  if (days !== 'all') {
    dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);
  }

  // 1. Pending Orders
  const { count: pendingOrders } = await supabase
    .from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');

  // 2. Revenue & Chart Data (Filtered by Timeframe)
  let revenueQuery = supabase
    .from('orders')
    .select('created_at, total_amount')
    .eq('status', 'completed')
    .order('created_at', { ascending: true });

  if (dateLimit) {
    revenueQuery = revenueQuery.gte('created_at', dateLimit.toISOString());
  }

  const { data: recentOrders } = await revenueQuery;
  
  const revenue = recentOrders?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

  // Build Chart Data
  const chartDataMap = {};
  
  if (days !== 'all') {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      chartDataMap[dateStr] = 0;
    }
  }

  recentOrders?.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (chartDataMap[date] !== undefined || days === 'all') {
      if (!chartDataMap[date]) chartDataMap[date] = 0;
      chartDataMap[date] += Number(order.total_amount);
    }
  });

  const chartData = Object.keys(chartDataMap).map(date => ({
    name: date,
    revenue: chartDataMap[date],
  }));

  // 3. Unread Messages 
  const { count: unreadMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('sender_role', 'customer');

  // 4. Pending Reviews
  const { count: pendingReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 5. Total Users & Out of Stock
  const { count: activeUsers } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true });

  const { count: outOfStock } = await supabase
    .from('products').select('*', { count: 'exact', head: true }).eq('available', false);

  // 6. Best Sellers (✨ OPTIMIZED: Bound by time to prevent infinite table scanning)
  let bestSellersQuery = supabase
    .from('order_items')
    // We use an !inner join so we only fetch items attached to a completed order
    // within our specific dateLimit.
    .select('quantity, products(name), orders!inner(created_at, status)')
    .eq('orders.status', 'completed');

  if (dateLimit) {
    bestSellersQuery = bestSellersQuery.gte('orders.created_at', dateLimit.toISOString());
  }

  const { data: orderItems } = await bestSellersQuery;

  const productSales = {};
  if (orderItems) {
    orderItems.forEach(item => {
      const prodName = item.products?.name || 'Unknown Scent';
      if (!productSales[prodName]) productSales[prodName] = 0;
      productSales[prodName] += item.quantity;
    });
  }

  const bestSellers = Object.keys(productSales)
    .map(name => ({ name, value: productSales[name] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return {
    pendingOrders: pendingOrders || 0,
    unreadMessages: unreadMessages || 0,
    pendingReviews: pendingReviews || 0,
    revenue,
    activeUsers: activeUsers || 0,
    outOfStock: outOfStock || 0,
    chartData,
    bestSellers,
    lowStockProducts: [],
  };
};