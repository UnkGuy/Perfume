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

  const chartDataMap = {};
  recentOrders?.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!chartDataMap[date]) chartDataMap[date] = 0;
    chartDataMap[date] += order.total_amount;
  });

  const chartData = Object.keys(chartDataMap).map(date => ({
    name: date,
    revenue: chartDataMap[date]
  }));

  // ✨ 3. NEW: Fetch Best Sellers for the Pie Chart ✨
  const { data: orderItems } = await supabase
    .from('order_items')
    .select(`quantity, products ( name )`); // Join with products table to get names!

  const productSales = {};
  if (orderItems) {
    orderItems.forEach(item => {
      const prodName = item.products?.name || 'Unknown Scent';
      if (!productSales[prodName]) productSales[prodName] = 0;
      productSales[prodName] += item.quantity;
    });
  }

  // Convert to an array, sort by highest sold, and take the top 5
  const bestSellers = Object.keys(productSales)
    .map(name => ({ name, value: productSales[name] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return { 
    inquiries: inquiries || 0, 
    revenue, 
    activeUsers: activeUsers || 0, 
    outOfStock: outOfStock || 0, 
    chartData, 
    bestSellers // Pass it to the frontend
  };
};