import React, { useState } from 'react';
import { TrendingUp, Users, ShoppingBag, AlertCircle, Loader2, AlertTriangle, Download, MessageCircle, Star, ArrowUpRight } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PIE_COLORS = ['#d4af37', '#60a5fa', '#34d399', '#f97316', '#a78bfa'];

const AdminOverview = ({ onNavigate }) => {
  const [timeframe, setTimeframe] = useState(30);
  const { stats, isLoading } = useDashboardStats(timeframe);

  const exportReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    // --- Section 1: Summary Metrics ---
    csvContent += "--- DASHBOARD SUMMARY ---\n";
    csvContent += "Metric,Value\n";
    csvContent += `Pending Orders,${stats.pendingOrders}\n`;
    csvContent += `Est. Revenue,${stats.revenue}\n`;
    csvContent += `Active Customers,${stats.activeUsers}\n`;
    csvContent += `Unread Messages,${stats.unreadMessages}\n`;
    csvContent += `Pending Reviews,${stats.pendingReviews}\n`;
    csvContent += `Unavailable Items,${stats.outOfStock}\n\n`;

    // --- Section 2: Revenue Trend ---
    if (stats.chartData && stats.chartData.length > 0) {
      csvContent += `--- REVENUE TREND (${timeframe === 'all' ? 'All Time' : `Last ${timeframe} Days`}) ---\n`;
      csvContent += "Date,Revenue\n";
      stats.chartData.forEach(row => {
        csvContent += `"${row.name}",${row.revenue}\n`;
      });
      csvContent += "\n";
    }

    // --- Section 3: Best Sellers ---
    if (stats.bestSellers && stats.bestSellers.length > 0) {
      csvContent += "--- TOP BEST SELLERS ---\n";
      csvContent += "Product Name,Units Sold\n";
      stats.bestSellers.forEach(row => {
        csvContent += `"${row.name}",${row.value}\n`; // Quoted to prevent commas from breaking CSV
      });
      csvContent += "\n";
    }

    // --- Section 4: Low Stock Alert ---
    if (stats.lowStockProducts && stats.lowStockProducts.length > 0) {
      csvContent += "--- LOW STOCK ALERT ---\n";
      csvContent += "Product,Brand,Variant Size,Stock Left\n";
      stats.lowStockProducts.forEach(row => {
        const name = row.products?.name || row.name;
        const brand = row.products?.brand || row.brand;
        csvContent += `"${name}","${brand}","${row.size}",${row.stock_count}\n`;
      });
    }

    // Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gold-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">Dashboard Overview</h3>
          <p className="text-gray-400 text-sm">Key metrics and sales data summary.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Timeframe Filter */}
          <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
            {[7, 30, 90, 'all'].map((days) => (
              <button
                key={days}
                onClick={() => setTimeframe(days)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  timeframe === days ? 'bg-gold-400 text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {days === 'all' ? 'All Time' : `${days}D`}
              </button>
            ))}
          </div>

          <button onClick={exportReport} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2 rounded-lg font-bold text-sm transition-colors">
            <Download size={16} /> Detailed Export
          </button>
        </div>
      </div>

      {/* Primary Action Metrics (Clickable) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <StatCard 
          icon={<ShoppingBag size={20} />} 
          color="gold"   
          title="Pending Orders"   
          value={stats.pendingOrders} 
          onClick={() => onNavigate('orders')}
          clickable
        />
        <StatCard 
          icon={<MessageCircle size={20} />} 
          color="blue" 
          title="Unread Messages" 
          value={stats.unreadMessages} 
          onClick={() => onNavigate('messages')}
          clickable
        />
        <StatCard 
          icon={<Star size={20} />} 
          color="orange"        
          title="Pending Reviews"  
          value={stats.pendingReviews} 
          onClick={() => onNavigate('reviews')}
          clickable
        />
      </div>

      {/* Secondary Data Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <StatCard 
          icon={<TrendingUp size={20} />}  
          color="green"  
          title={`Revenue ${timeframe === 'all' ? '(All Time)' : `(${timeframe} Days)`}`} 
          value={`₱${stats.revenue.toLocaleString()}`} 
        />
        <StatCard 
          icon={<Users size={20} />}        
          color="blue"   
          title="Active Customers"  
          value={stats.activeUsers} 
        />
        <StatCard 
          icon={<AlertCircle size={20} />}  
          color="orange" 
          title="Unavailable Items" 
          value={stats.outOfStock}
          onClick={() => onNavigate('products')}
          clickable
        />
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl md:rounded-2xl lg:col-span-2">
          <h3 className="text-sm md:text-lg font-bold text-white mb-4 md:mb-6 uppercase tracking-widest">
            Revenue Trend
          </h3>
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
              Not enough data for this timeframe.
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
              No sales data available.
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div 
          onClick={() => onNavigate && onNavigate('products')}
          className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 md:p-6 mt-6 cursor-pointer hover:bg-orange-500/10 transition-colors group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-400 flex-shrink-0" />
              <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest">
                Low Stock Alert — {stats.lowStockProducts.length} variant{stats.lowStockProducts.length > 1 ? 's' : ''} running low
              </h3>
            </div>
            <ArrowUpRight size={18} className="text-orange-400/50 group-hover:text-orange-400 transition-colors" />
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

const StatCard = ({ icon, color, title, value, onClick, clickable }) => {
  const colorMap = { gold: 'bg-gold-400/10 text-gold-400', green: 'bg-green-500/10 text-green-400', blue: 'bg-blue-500/10 text-blue-400', orange: 'bg-orange-500/10 text-orange-400' };
  
  const baseClass = "bg-white/5 border border-white/10 p-3 md:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 transition-all duration-200 relative overflow-hidden";
  const interactiveClass = clickable ? "cursor-pointer hover:border-white/30 hover:bg-white/10 hover:-translate-y-0.5 active:scale-[0.98] group" : "";

  return (
    <div onClick={onClick} className={`${baseClass} ${interactiveClass}`}>
      <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${clickable ? 'group-hover:scale-110' : ''} ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="overflow-hidden w-full flex-1">
        <p className="text-[9px] md:text-xs text-gray-400 font-medium uppercase tracking-widest mb-0.5 md:mb-1 truncate">{title}</p>
        <p className="text-lg md:text-2xl font-bold text-white truncate">{value}</p>
      </div>
      {clickable && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight size={14} className="text-white/50" />
        </div>
      )}
    </div>
  );
};

export default AdminOverview;