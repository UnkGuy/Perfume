import React from 'react';
import { TrendingUp, Users, ShoppingBag, AlertCircle, Loader2 } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminOverview = () => {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gold-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. TOP STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<ShoppingBag size={24}/>} color="gold" title="Total Inquiries" value={stats.inquiries} />
        <StatCard icon={<TrendingUp size={24}/>} color="green" title="Est. Revenue" value={`₱${stats.revenue.toLocaleString()}`} />
        <StatCard icon={<Users size={24}/>} color="blue" title="Active Customers" value={stats.activeUsers} />
        <StatCard icon={<AlertCircle size={24}/>} color="orange" title="Unavailable Items" value={stats.outOfStock} />
      </div>

      {/* 2. REVENUE CHART */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest">Revenue (Last 30 Days)</h3>
        
        {stats.chartData && stats.chartData.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {/* The luxury gold gradient */}
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#d4af3750', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#d4af37', fontWeight: 'bold' }}
                  formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-xl">
            Not enough data to display chart yet.
          </div>
        )}
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
    <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center gap-4 hover:border-white/20 transition-colors">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default AdminOverview;