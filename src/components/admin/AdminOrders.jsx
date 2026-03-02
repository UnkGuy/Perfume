import React, { useState, useEffect } from 'react';
import { Loader2, Eye, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      // Fetch orders, including the user's email so we know who to talk to!
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          created_at, 
          status, 
          total_amount,
          auth_users:user_id(email)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-gold-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
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
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">No orders found.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-gold-400">#{order.id}</td>
                  <td className="p-4">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-4">{order.auth_users?.email || 'Unknown User'}</td>
                  <td className="p-4 font-bold text-white">₱{order.total_amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                      order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-colors" title="View Details">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 bg-gold-400/10 hover:bg-gold-400/20 text-gold-400 rounded transition-colors" title="Chat with Customer">
                      <MessageCircle size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;