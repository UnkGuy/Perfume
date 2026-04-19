import React from 'react';
import { TrendingUp, Users, ShoppingBag, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = ['#d4af37', '#60a5fa', '#34d399', '#f97316', '#a78bfa'];

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
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard icon={<ShoppingBag size={20} />} color="gold"   title="Total Inquiries"    value={stats.inquiries} />
        <StatCard icon={<TrendingUp size={20} />}  color="green"  title="Est. Revenue"       value={`₱${stats.revenue.toLocaleString()}`} />
        <StatCard icon={<Users size={20} />}        color="blue"   title="Active Customers"   value={stats.activeUsers} />
        <StatCard icon={<AlertCircle size={20} />}  color="orange" title="Unavailable Items"  value={stats.outOfStock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl lg:col-span-2">
          <h3 className="text-sm md:text-lg font-bold text-white mb-4 md:mb-6 uppercase tracking-widest">Revenue (Last 30 Days)</h3>
          {stats.chartData && stats.chartData.length > 0 ? (
            <div className="h-60 md:h-80 w-full" style={{ minHeight: 250, minWidth: '100%' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={250} minWidth={0}>
                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₱${v}`} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#111', borderColor: '#d4af3750', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#d4af37', fontWeight: 'bold' }}
                    formatter={v => [`₱${v.toLocaleString()}`, 'Revenue']}
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

        <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl lg:col-span-1 flex flex-col">
          <h3 className="text-sm md:text-lg font-bold text-white mb-1 uppercase tracking-widest">Top Best Sellers</h3>
          <p className="text-xs text-gray-500 mb-4">Most → least sold</p>
          {stats.bestSellers && stats.bestSellers.length > 0 ? (
            <div className="h-64 md:h-72 w-full flex-1" style={{ minHeight: 250, minWidth: '100%' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={250} minWidth={0}>
                <PieChart>
                  <Pie data={stats.bestSellers} cx="50%" cy="40%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                    {stats.bestSellers.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#111', borderColor: '#d4af3750', borderRadius: '8px', color: '#fff', border: '1px solid #ffffff20' }}
                    itemStyle={{ color: '#d4af37', fontWeight: 'bold' }}
                    formatter={v => [`${v} Units Sold`, 'Sales']}
                  />
                  <Legend
                    verticalAlign="bottom" height={56} iconType="circle" iconSize={8}
                    wrapperStyle={{ fontSize: '10px', paddingTop: '12px' }}
                    formatter={(value, entry) => (<span style={{ color: entry.color }}>{value}</span>)}
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

      {stats.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-400 flex-shrink-0" />
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest">
              Low Stock Alert — {stats.lowStockProducts.length} variant{stats.lowStockProducts.length > 1 ? 's' : ''} running low
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.lowStockProducts.map(variant => (
              <div key={variant.id} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-lg px-4 py-3">
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">
                    {variant.products?.name || variant.name} 
                    <span className="text-gold-400 text-xs ml-1">({variant.size})</span>
                  </p>
                  <p className="text-xs text-gray-500 truncate">{variant.products?.brand || variant.brand}</p>
                </div>
                <div className="flex-shrink-0 ml-3 text-right">
                  <span className={`text-lg font-bold ${variant.stock_count <= 1 ? 'text-red-400' : 'text-orange-400'}`}>
                    {variant.stock_count}
                  </span>
                  <p className="text-[10px] text-gray-500">left</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, color, title, value }) => {
  const colorMap = { gold: 'bg-gold-400/10 text-gold-400', green: 'bg-green-500/10 text-green-400', blue: 'bg-blue-500/10 text-blue-400', orange: 'bg-orange-500/10 text-orange-400' };
  return (
    <div className="bg-white/5 border border-white/10 p-3 md:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 hover:border-white/20 transition-colors">
      <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>{icon}</div>
      <div className="overflow-hidden w-full">
        <p className="text-[9px] md:text-xs text-gray-400 font-medium uppercase tracking-widest mb-0.5 md:mb-1 truncate">{title}</p>
        <p className="text-lg md:text-2xl font-bold text-white truncate">{value}</p>
      </div>
    </div>
  );
};

export default AdminOverview;