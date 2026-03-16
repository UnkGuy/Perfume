import React from 'react';
import { TrendingUp, Users, ShoppingBag, AlertCircle, Loader2 } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';

const AdminOverview = () => {
  // Look how clean this is now!
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gold-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

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

// Reusable mini-component
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