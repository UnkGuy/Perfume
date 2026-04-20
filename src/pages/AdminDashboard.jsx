import React, { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare, LogOut, Menu, X,
  Tag, ClipboardList, Users, Settings, Star
} from 'lucide-react';

import AdminOverview  from '../components/admin/AdminOverview';
import AdminOrders    from '../components/admin/AdminOrders';
import AdminProducts  from '../components/admin/AdminProducts';
import AdminMessages  from '../components/admin/AdminMessages';
import AdminPromos    from '../components/admin/AdminPromos';
import AdminLogs      from '../components/admin/AdminLogs';
import AdminUsers     from '../components/admin/AdminUsers';
import AdminSettings  from '../components/admin/AdminSettings';
import AdminReviews   from '../components/admin/AdminReviews'; // NEW

import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';

const NAV = [
  { id: 'overview',  icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { id: 'orders',    icon: <ShoppingCart size={18} />,    label: 'Order Inquiries' },
  { id: 'messages',  icon: <MessageSquare size={18} />,   label: 'Messages' },
  { id: 'products',  icon: <Package size={18} />,         label: 'Inventory' },
  { id: 'promos',    icon: <Tag size={18} />,             label: 'Promo Codes' },
  { id: 'users',     icon: <Users size={18} />,           label: 'Accounts' },
  { id: 'reviews',   icon: <Star size={18} />,            label: 'Moderate Reviews' }, // NEW
  { id: 'logs',      icon: <ClipboardList size={18} />,   label: 'Activity Log' },
  { id: 'settings',  icon: <Settings size={18} />,        label: 'Website Settings' }, 
];

const AdminDashboard = () => {
  const { user, handleLogout } = useAuth();
  const { showToast } = useShop();

  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [targetMessageUser, setTargetMessageUser] = useState(null);

  const handleTabClick = (tab, userId = null) => {
    setActiveTab(tab);
    if (userId) setTargetMessageUser(userId);
    setIsMobileMenuOpen(false);
  };

  const adminLogout = async () => {
    await handleLogout();
  };

  const tabLabel = NAV.find(n => n.id === activeTab)?.label || activeTab;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-rich-black border-r border-white/10 flex flex-col h-full transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <button onClick={() => handleTabClick('overview')} className="text-left group">
            <h1 className="text-xl font-bold tracking-widest text-white group-hover:text-gold-400 transition-colors">
              KL<span className="text-gold-400">SCENTS</span>
            </h1>
            <span className="text-xs text-gray-500 block mt-0.5 group-hover:text-gray-300 transition-colors">ADMIN PORTAL</span>
          </button>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => handleTabClick(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-gold-400/10 text-gold-400 border border-gold-400/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold uppercase">
              {user?.email?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.email || 'Admin Mode'}</p>
              <p className="text-[10px] text-gold-400 uppercase tracking-widest">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/products'}
            className="w-full flex items-center gap-3 px-4 py-2 text-gold-400 hover:bg-gold-400/10 rounded-lg transition-colors mb-2"
          >
            <Package size={18} /> View Collection
          </button>
          <button
            onClick={adminLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:ml-64 min-h-screen w-full">
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-rich-black sticky top-0 z-30">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-gold-400 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold tracking-widest text-white">KL<span className="text-gold-400">SCENTS</span></h1>
          <div className="w-6" />
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <header className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{tabLabel}</h2>
          </header>
          <div className="min-h-[500px]">
            {activeTab === 'overview'  && <AdminOverview />}
            {activeTab === 'orders'    && <AdminOrders onNavigateToMessages={(userId) => handleTabClick('messages', userId)} />}
            {activeTab === 'messages'  && <AdminMessages defaultSelectedUser={targetMessageUser} />}
            {activeTab === 'products'  && <AdminProducts />}
            {activeTab === 'promos'    && <AdminPromos />}
            {activeTab === 'users'     && <AdminUsers />}
            {activeTab === 'reviews'   && <AdminReviews />}
            {activeTab === 'logs'      && <AdminLogs />}
            {activeTab === 'settings'  && <AdminSettings />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;