import { supabase } from './supabase';

export const fetchDashboardStatsAPI = async () => {
  // 1. Top-level numbers
  const { count: inquiries } = await supabase
    .from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending');

 const { data: revData } = await supabase.from('orders').select('total_amount').eq('status', 'completed');
const revenue = revData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;
  const { count: activeUsers } = await supabase
    .from('profiles').select('*', { count: 'exact', head: true });

  const { count: outOfStock } = await supabase
    .from('products').select('*', { count: 'exact', head: true }).eq('available', false);

  // 2. Revenue chart (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const { data: recentOrders } = await supabase
  .from('orders')
  .select('created_at, total_amount')
  .eq('status', 'completed') // <-- Added filter
  .gte('created_at', thirtyDaysAgo.toISOString())
  .order('created_at', { ascending: true });

  const chartDataMap = {};
  recentOrders?.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!chartDataMap[date]) chartDataMap[date] = 0;
    chartDataMap[date] += Number(order.total_amount);
  });

  const chartData = Object.keys(chartDataMap).map(date => ({
    name: date,
    revenue: chartDataMap[date],
  }));

  // 3. Best sellers
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('quantity, products(name)');

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

  // 4. ← NEW: Low stock products (tracked stock < 5, not unlimited/null)
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('id, name, brand, stock_count, available')
    .not('stock_count', 'is', null) // only products with tracked stock
    .lt('stock_count', 5)           // fewer than 5 units
    .eq('available', true)          // still marked available (needs attention)
    .order('stock_count', { ascending: true })
    .limit(10);

  return {
    inquiries: inquiries || 0,
    revenue,
    activeUsers: activeUsers || 0,
    outOfStock: outOfStock || 0,
    chartData,
    bestSellers,
    lowStockProducts: lowStockProducts || [],
  };
};