import React, { useState, useEffect } from 'react';
import { Loader2, Search, Ban, CheckCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useShop } from '../../contexts/ShopContext';

const AdminUsers = () => {
  const { showToast } = useShop();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');  

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    
    try {
      // 1. Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;

      // 2. Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (rolesError) throw rolesError;

      // 3. Merge the two datasets together based on user_id / id
      const mergedUsers = profilesData.map(profile => {
        const userRoleMatch = rolesData.find(r => r.user_id === profile.id);
        return {
          ...profile,
          // We wrap the role in an array so your existing JSX `u.user_roles?.[0]?.role` still works!
          user_roles: userRoleMatch ? [userRoleMatch] : [] 
        };
      });

      setUsers(mergedUsers);
    } catch (error) {
      console.error("Supabase Error fetching users:", error);
      // This will now pop up a red toast box telling you exactly what went wrong
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
    }
  };

  const filtered = users.filter(u => {
  const matchesSearch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
  const role = u.user_roles?.[0]?.role || 'customer';
  const matchesRole = roleFilter === 'all' || role === roleFilter;
  return matchesSearch && matchesRole;
});

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">Accounts</h3>
          <p className="text-gray-400 text-sm">Manage registered users and permissions.</p>
        </div>
        <div className="flex gap-3 items-center">
  <select 
    value={roleFilter} 
    onChange={e => setRoleFilter(e.target.value)}
    className="bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-gold-400"
  >
    <option value="all">All Roles</option>
    <option value="customer">Customers</option>
    <option value="admin">Admins</option>
  </select>
  <div className="relative w-64">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
    <input type="text" placeholder="Search email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
      className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gold-400"
    />
  </div>
</div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40 border-b border-white/10 text-xs uppercase text-gray-500">
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {isLoading ? <tr><td colSpan="4" className="p-8 text-center"><Loader2 className="animate-spin text-gold-400 mx-auto" /></td></tr> 
            : filtered.map(u => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-medium">{u.email}</td>
                <td className="p-4 text-gray-400 uppercase text-xs tracking-wider">{u.user_roles?.[0]?.role || 'customer'}</td>
                <td className="p-4">
                  {u.is_banned 
                    ? <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs font-bold">Blocked</span>
                    : <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs font-bold">Active</span>}
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleToggleBan(u.id, u.is_banned)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${u.is_banned ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'}`}>
                    {u.is_banned ? 'Unblock' : 'Block Account'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminUsers;