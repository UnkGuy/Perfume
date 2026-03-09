import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingBag, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminOverview = () => {
  const [stats, setStats] = useState({ inquiries: 0, revenue: 0, activeUsers: 0, outOfStock: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Total Inquiries & Revenue
      const { data: orders } = await supabase.from('orders').select('total_amount');
      const totalRev = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      
      // 2. Active Users (Users who have placed at least one inquiry)
      const uniqueUsers = new Set(orders?.map(o => o.user_id)).size;

      // 3. Unavailable Products
      const { count: unavailableCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('available', false);

      setStats({
        inquiries: orders?.length || 0,
        revenue: totalRev,
        activeUsers: uniqueUsers,
        outOfStock: unavailableCount || 0
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<ShoppingBag size={24}/>} color="gold" title="Total Inquiries" value={stats.inquiries} />
        <StatCard icon={<TrendingUp size={24}/>} color="green" title="Est. Revenue" value={`₱${stats.revenue.toLocaleString()}`} />
        <StatCard icon={<Users size={24}/>} color="blue" title="Active Customers" value={stats.activeUsers} />
        <StatCard icon={<AlertCircle size={24}/>} color="orange" title="Unavailable Items" value={stats.outOfStock} />
      </div>
    </div>
  );
};

// Reusable mini-component to keep it clean
const StatCard = ({ icon, color, title, value }) => {
  const colorMap = {
    gold: 'bg-gold-400/10 text-gold-400',
    green: 'bg-green-500/10 text-green-400',
    blue: 'bg-blue-500/10 text-blue-400',
    orange: 'bg-orange-500/10 text-orange-400'
  };
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};
export default AdminOverview;