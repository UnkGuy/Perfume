import React from 'react';
import { TrendingUp, Users, ShoppingBag, AlertCircle } from 'lucide-react';

const AdminOverview = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Cards */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Inquiries</p>
            <p className="text-2xl font-bold text-white">24</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Est. Revenue</p>
            <p className="text-2xl font-bold text-white">₱45,200</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Active Customers</p>
            <p className="text-2xl font-bold text-white">18</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400">Pending Actions</p>
            <p className="text-2xl font-bold text-white">5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;