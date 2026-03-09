import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, LogOut } from 'lucide-react'; 

import AdminOverview from '../components/admin/AdminOverview';
import AdminOrders from '../components/admin/AdminOrders';
import AdminProducts from '../components/admin/AdminProducts';
import AdminMessages from '../components/admin/AdminMessages'; 

const AdminDashboard = ({ setCurrentPage, handleLogout, user, showToast }) => { 
  const [activeTab, setActiveTab] = useState('overview');

  const adminLogout = () => {
    handleLogout();
    setCurrentPage('welcome');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex">
      <aside className="w-64 bg-rich-black border-r border-white/10 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-widest text-white cursor-pointer" onClick={() => setCurrentPage('welcome')}>
            KL<span className="text-gold-400">SCENTS</span> <span className="text-xs text-gray-500 block mt-1">ADMIN PORTAL</span>
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard size={18} /> Overview
          </button>
          
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <ShoppingCart size={18} /> Order Inquiries
          </button>

          <button onClick={() => setActiveTab('messages')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'messages' ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <MessageSquare size={18} /> Messages
          </button>

          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <Package size={18} /> Inventory
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold uppercase">{user?.email?.charAt(0) || 'A'}</div>
            <div className="overflow-hidden"><p className="text-sm font-bold truncate">{user?.email || 'Admin Mode'}</p></div>
          </div>
          <button onClick={adminLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
            <LogOut size={18} /> Exit Admin
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-white capitalize">{activeTab === 'overview' ? 'Dashboard Overview' : activeTab}</h2>
        </header>

        <div className="min-h-[500px]">
          {activeTab === 'overview' && <AdminOverview />}
          
          {/* MAGIC HAPPENS HERE: Passing setActiveTab and showToast to AdminOrders */}
          {activeTab === 'orders' && <AdminOrders showToast={showToast} setActiveTab={setActiveTab} />}
          
          {activeTab === 'messages' && <AdminMessages showToast={showToast} />} 
          {activeTab === 'products' && <AdminProducts showToast={showToast} />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;