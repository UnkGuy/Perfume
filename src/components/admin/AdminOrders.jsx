import React, { useState } from 'react';
import { Loader2, Eye, EyeOff, MessageCircle, Search } from 'lucide-react'; // <-- ADDED SEARCH
import { useOrders } from '../../hooks/useOrders'; 

const AdminOrders = ({ showToast, setActiveTab }) => {
  const { orders, isLoading, changeOrderStatus } = useOrders(showToast);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // <-- NEW SEARCH STATE

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // <-- FILTER LOGIC -->
  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchQuery) ||
    (order.profiles?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gold-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      
      {/* HEADER ACTIONS */}
      {/* Changed to flex-col on mobile so the search bar and button stack neatly */}
      <div className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/20">
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search ID, email, or status..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
          />
        </div>

        <button 
          onClick={() => setActiveTab('messages')} 
          className="w-full md:w-auto flex justify-center items-center gap-2 px-4 py-2 bg-gold-400/10 hover:bg-gold-400/20 text-gold-400 rounded transition-colors text-sm font-bold" 
          title="Go to Messages"
        >
          <MessageCircle size={16} /> Open Messages Console
        </button>
      </div>

      {/* ========================================== */}
      {/* DESKTOP VIEW: STANDARD TABLE (Hidden on Mobile) */}
      {/* ========================================== */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-gray-300">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">No orders found matching "{searchQuery}".</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  {/* MAIN ROW */}
                  <tr className={`hover:bg-white/5 transition-colors ${expandedOrderId === order.id ? 'bg-white/5' : ''}`}>
                    <td className="p-4 font-mono text-gold-400">#{order.id}</td>
                    <td className="p-4">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-4">{order.profiles?.email || 'Unknown User'}</td>
                    <td className="p-4 font-bold text-white">₱{order.total_amount.toLocaleString()}</td>
                    <td className="p-4">
                      <select 
                        value={order.status}
                        onChange={(e) => changeOrderStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none text-center ${
                          order.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 
                          order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                          'bg-green-500/10 text-green-400 border border-green-500/30'
                        }`}
                      >
                        <option value="pending" className="bg-rich-black text-white">Pending</option>
                        <option value="shipped" className="bg-rich-black text-white">Shipped</option>
                        <option value="completed" className="bg-rich-black text-white">Completed</option>
                      </select>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button 
                        onClick={() => toggleExpand(order.id)}
                        className={`p-2 rounded transition-colors ${expandedOrderId === order.id ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`} 
                        title="View Details"
                      >
                        {expandedOrderId === order.id ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button 
                        onClick={() => setActiveTab('messages')}
                        className="p-2 bg-gold-400/10 hover:bg-gold-400/20 text-gold-400 rounded transition-colors" 
                        title="Go to Messages"
                      >
                        <MessageCircle size={16} />
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED DETAILS ROW */}
                  {expandedOrderId === order.id && (
                    <tr className="bg-black/40 border-b border-white/10">
                      <td colSpan="6" className="p-6">
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-bold">Order Items</h4>
                          <div className="space-y-2">
                            {order.order_items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <div>
                                  <span className="text-gold-400 font-bold mr-2">{item.quantity}x</span>
                                  <span className="text-white">{item.products?.name || 'Unknown Product'}</span>
                                </div>
                                <span className="text-gray-400 font-mono">₱{(item.price_at_time * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================== */}
      {/* MOBILE VIEW: STACKED CARDS (Hidden on Desktop) */}
      {/* ========================================== */}
      <div className="md:hidden flex flex-col divide-y divide-white/10">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders found matching "{searchQuery}".</div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="p-4 flex flex-col gap-4 hover:bg-white/5 transition-colors">
              
              {/* Card Header: ID and Date */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-gold-400 font-bold text-lg">#{order.id}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-lg">₱{order.total_amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Customer Email */}
              <div className="bg-black/40 rounded p-2 border border-white/5">
                <p className="text-sm text-gray-300 truncate">{order.profiles?.email || 'Unknown User'}</p>
              </div>

              {/* Action Row: Status Dropdown & Buttons */}
              <div className="flex justify-between items-center gap-3">
                <select 
                  value={order.status}
                  onChange={(e) => changeOrderStatus(order.id, e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none text-center ${
                    order.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 
                    order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                    'bg-green-500/10 text-green-400 border border-green-500/30'
                  }`}
                >
                  <option value="pending" className="bg-rich-black text-white">Pending</option>
                  <option value="shipped" className="bg-rich-black text-white">Shipped</option>
                  <option value="completed" className="bg-rich-black text-white">Completed</option>
                </select>

                <div className="flex gap-2 flex-shrink-0">
                  <button 
                    onClick={() => toggleExpand(order.id)}
                    className={`p-2 rounded transition-colors ${expandedOrderId === order.id ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`} 
                  >
                    {expandedOrderId === order.id ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button 
                    onClick={() => setActiveTab('messages')}
                    className="p-2 bg-gold-400/10 hover:bg-gold-400/20 text-gold-400 rounded transition-colors" 
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
              </div>

              {/* Expanded Details Section for Mobile */}
              {expandedOrderId === order.id && (
                <div className="mt-2 bg-black/40 border border-white/10 rounded-lg p-3 animate-fade-in">
                  <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold border-b border-white/10 pb-2">Order Items</h4>
                  <div className="space-y-2.5">
                    {order.order_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start text-xs gap-3">
                        <div className="flex-1 overflow-hidden">
                          <span className="text-gold-400 font-bold mr-1.5">{item.quantity}x</span>
                          <span className="text-gray-300 line-clamp-2 leading-tight">{item.products?.name || 'Unknown Product'}</span>
                        </div>
                        <span className="text-gray-400 font-mono mt-0.5 flex-shrink-0">₱{(item.price_at_time * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrders;