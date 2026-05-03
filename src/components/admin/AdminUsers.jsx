import React, { useState, useEffect } from 'react'; 
import { Loader2, Search, Ban, CheckCircle } from 'lucide-react'; 
import { supabase } from '../../services/supabase'; 
import { useShop } from '../../contexts/ShopContext'; 
import { updateUserRoleAPI } from '../../services/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { logAdminActionAPI } from '../../services/logApi';

const AdminUsers = () => { 
  const { showToast } = useShop(); 
  const { user: adminUser } = useAuth();
  const [users, setUsers] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => { 
    setIsLoading(true); 
    try { 
      const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('*'); 
      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase.from('user_roles').select('*');
      if (rolesError) throw rolesError;

      const mergedUsers = profilesData.map(profile => {
        const userRoleMatch = rolesData.find(r => r.user_id === profile.id);
        return { ...profile, user_roles: userRoleMatch ? [userRoleMatch] : [] };
      });
      setUsers(mergedUsers);
    } catch (error) {
      if (showToast) showToast('Database Error', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBan = async (userId, currentStatus) => { 
    const { error } = await supabase.from('profiles').update({ is_banned: !currentStatus }).eq('id', userId); 
    if (!error) { 
      setUsers(users.map(u => u.id === userId ? { ...u, is_banned: !currentStatus } : u)); 
      showToast('Success', `Account ${!currentStatus ? 'banned' : 'unbanned'}.`); 
      
      logAdminActionAPI(adminUser?.email, !currentStatus ? 'Blocked User' : 'Unblocked User', `User ID: ${userId}`);
    } 
  };

  const handleRoleChange = async (userId, newRole) => { 
    try { 
      await updateUserRoleAPI(userId, newRole); 
      setUsers(users.map(u => u.id === userId ? { ...u, user_roles: [{ role: newRole }] } : u)); 
      showToast('Success', `User role updated to ${newRole}.`); 
      
      logAdminActionAPI(adminUser?.email, 'Changed User Role', `User ID: ${userId} to ${newRole}`);
    } catch (error) { 
      showToast('Error', 'Failed to update role.', 'error'); 
    } 
  };

  const filtered = users.filter(u => { 
    const matchesSearch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()); 
    const role = u.user_roles?.[0]?.role || 'customer'; 
    const matchesRole = roleFilter === 'all' || role === roleFilter; 
    return matchesSearch && matchesRole; 
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">Accounts</h3>
          <p className="text-gray-400 text-sm">Manage registered users and permissions.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-gold-400 w-full sm:w-auto" > 
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Search email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold-400" />
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto w-full">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-black/40 border-b border-white/10 text-xs uppercase text-gray-500">
              <th className="p-4 font-medium w-1/3 text-left">Email</th>
              <th className="p-4 font-medium w-1/4 text-right">Role</th>
              <th className="p-4 font-medium w-1/6 text-right">Status</th>
              <th className="p-4 font-medium text-right w-1/4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {isLoading ? <tr><td colSpan="4" className="p-8 text-center"><Loader2 className="animate-spin text-gold-400 mx-auto" /></td></tr> 
            : filtered.map(u => {
              const currentRole = u.user_roles?.[0]?.role || 'customer';
              return (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium break-all sm:break-words text-left flex justify-start">
                    <div className="max-w-[150px] sm:max-w-xs md:max-w-sm lg:max-w-md truncate text-left" title={u.email}>
                      {u.email}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end">
                      <select 
                        value={currentRole}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-gray-300 uppercase tracking-wider focus:outline-none focus:border-gold-400 cursor-pointer w-full max-w-[120px] text-center"
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end">
                      {u.is_banned 
                        ? <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Blocked</span>
                        : <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Active</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end">
                      <button onClick={() => handleToggleBan(u.id, u.is_banned)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap ${u.is_banned ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'}`}>
                        {u.is_banned ? 'Unblock' : 'Block Account'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  ); 
}; 

export default AdminUsers;