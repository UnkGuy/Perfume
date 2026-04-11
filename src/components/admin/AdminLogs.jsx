import React, { useState, useEffect } from 'react';
import { Loader2, Search, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../services/supabase';

const PAGE_SIZE = 20;

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setActivePage(1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const from = (activePage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
          .from('admin_logs')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        // Client-side filter limitation: Supabase text search requires ilike
        if (searchQuery.trim()) {
          query = query.or(
            `admin_email.ilike.%${searchQuery}%,action.ilike.%${searchQuery}%,target_item.ilike.%${searchQuery}%`
          );
        }

        const { data, count, error } = await query;
        if (error) throw error;
        setLogs(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        console.error('Failed to fetch admin logs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [activePage, searchQuery]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const actionColor = (action) => {
    if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('blocked')) return 'text-red-400';
    if (action.toLowerCase().includes('add') || action.toLowerCase().includes('create') || action.toLowerCase().includes('unblocked')) return 'text-green-400';
    if (action.toLowerCase().includes('update') || action.toLowerCase().includes('edit')) return 'text-blue-400';
    return 'text-gray-300';
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-1">Activity Log</h3>
        <p className="text-gray-400 text-sm">All admin actions recorded in chronological order.</p>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search email, action, or item..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold-400 transition-colors"
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-gold-400" size={28} />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <ClipboardList size={36} className="mb-3 opacity-30" />
            <p className="text-sm">No log entries found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-black/40 border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
                    <th className="p-4 font-medium">Timestamp</th>
                    <th className="p-4 font-medium">Admin</th>
                    <th className="p-4 font-medium">Action</th>
                    <th className="p-4 font-medium">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-gray-500 font-mono text-xs">
                        {new Date(log.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}
                      </td>
                      <td className="p-4 text-gray-300 max-w-[180px] truncate">{log.admin_email}</td>
                      <td className={`p-4 font-medium ${actionColor(log.action)}`}>{log.action}</td>
                      <td className="p-4 text-gray-400 max-w-[200px] truncate">{log.target_item}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-white/10">
              {logs.map(log => (
                <div key={log.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-sm font-medium ${actionColor(log.action)}`}>{log.action}</span>
                    <span className="text-[10px] text-gray-500 font-mono flex-shrink-0">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{log.admin_email}</p>
                  <p className="text-xs text-gray-500 truncate">{log.target_item}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-white/10 bg-black/20">
            <span className="text-xs text-gray-500">{totalCount} total entries</span>
            <div className="flex items-center gap-2">
              <button
                disabled={activePage === 1}
                onClick={() => setActivePage(p => p - 1)}
                className="p-2 border border-white/10 rounded hover:border-gold-400 text-gray-400 hover:text-gold-400 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-400">{activePage} / {totalPages}</span>
              <button
                disabled={activePage === totalPages}
                onClick={() => setActivePage(p => p + 1)}
                className="p-2 border border-white/10 rounded hover:border-gold-400 text-gray-400 hover:text-gold-400 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;