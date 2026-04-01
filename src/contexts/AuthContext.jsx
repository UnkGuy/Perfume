import React, { createContext, useState, useEffect, useContext } from 'react';
// ✨ REMOVE direct supabase import ✨
import { fetchUserRoleAPI, logoutAPI, getSessionAPI, onAuthStateChangeAPI } from '../services/authApi'; 

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('customer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async (userId) => {
      const role = await fetchUserRoleAPI(userId);
      setUserRole(role);
      setLoading(false);
    };

    // ✨ Use the API wrappers! ✨
    getSessionAPI().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchRole(currentUser.id);
      else setLoading(false);
    });

    const { data: { subscription } } = onAuthStateChangeAPI((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchRole(currentUser.id);
      else {
        setUserRole('customer');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutAPI();
  };

  return (
    <AuthContext.Provider value={{ user, userRole, handleLogout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);