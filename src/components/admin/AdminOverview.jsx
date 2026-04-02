import React from 'react';
import { TrendingUp, Users, ShoppingBag, AlertCircle, Loader2 } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useShop } from '../../contexts/ShopContext';

// ✨ NEW RECHARTS IMPORTS ✨
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Luxury gradient colors for the Pie slices
const PIE_COLORS = ['#d4af37', '#b59325', '#917518', '#6b550b', '#423403'];

const AdminOverview = () => {
  const { showToast } = useShop();
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gold-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      
      {/* 1. TOP STAT CARDS */}
      {/* Changed to grid-cols-2 on mobile so they stack in pairs instead of a huge single column */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard icon={<ShoppingBag size={20} className="md:w-6 md:h-6" />} color="gold" title="Total Inquiries" value={stats.inquiries} />
        <StatCard icon={<TrendingUp size={20} className="md:w-6 md:h-6" />} color="green" title="Est. Revenue" value={`₱${stats.revenue.toLocaleString()}`} />
        <StatCard icon={<Users size={20} className="md:w-6 md:h-6" />} color="blue" title="Active Customers" value={stats.activeUsers} />
        <StatCard icon={<AlertCircle size={20} className="md:w-6 md:h-6" />} color="orange" title="Unavailable Items" value={stats.outOfStock} />
      </div>

      {/* 2. CHARTS SECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* LEFT CHART: Revenue Area Chart */}
        <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl lg:col-span-2">
          <h3 className="text-sm md:text-lg font-bold text-white mb-4 md:mb-6 uppercase tracking-widest">Revenue (Last 30 Days)</h3>
          
          {stats.chartData && stats.chartData.length > 0 ? (
            // Shorter height on mobile (h-60)
            <div className="h-60 md:h-80 w-full">
              <ResponsiveContainer width="99%" height="100%" minHeight={250}>
                {/* Adjusted margin to pull the Y-axis left on mobile, saving horizontal space */}
                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} md:fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} md:fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#d4af3750', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#d4af37', fontWeight: 'bold' }}
                    formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 md:h-80 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-xl">
              Not enough data to display chart yet.
            </div>
          )}
        </div>

        {/* ✨ RIGHT CHART: Best Sellers Pie Chart ✨ */}
        <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl lg:col-span-1 flex flex-col">
          <h3 className="text-sm md:text-lg font-bold text-white mb-4 md:mb-6 uppercase tracking-widest">Top Best Sellers</h3>
          
          {stats.bestSellers && stats.bestSellers.length > 0 ? (
            <div className="h-64 md:h-80 w-full flex-1">
              <ResponsiveContainer width="99%" height="100%" minHeight={250}>
                <PieChart>
                  <Pie
                    data={stats.bestSellers}
                    cx="50%"
                    cy="45%"
                    innerRadius={50} // Slightly smaller for mobile safety
                    outerRadius={80} // Slightly smaller for mobile safety
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.bestSellers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#d4af3750', borderRadius: '8px', color: '#fff', border: '1px solid #ffffff20' }}
                    itemStyle={{ color: '#d4af37', fontWeight: 'bold' }}
                    formatter={(value) => [`${value} Units Sold`, 'Sales']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '10px', color: '#888', paddingTop: '10px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 md:h-80 flex items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-xl text-center p-4">
              No sales data available yet.
            </div>
          )}
        </div>

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
    // Adjusted padding and gap for smaller screens
    <div className="bg-white/5 border border-white/10 p-3 md:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 hover:border-white/20 transition-colors">
      <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="overflow-hidden w-full">
        {/* Shrunk the title font so it doesn't wrap awkwardly */}
        <p className="text-[9px] md:text-xs text-gray-400 font-medium uppercase tracking-widest mb-0.5 md:mb-1 truncate">{title}</p>
        <p className="text-lg md:text-2xl font-bold text-white truncate">{value}</p>
      </div>
    </div>
  );
};

export default AdminOverview;