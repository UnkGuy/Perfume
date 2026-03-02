import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

// 1. Create the Context
const AuthContext = createContext({});

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('customer'); // NEW: Track the role!
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Helper function to fetch the role
    const fetchRole = async (userId) => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
        
      if (data) setUserRole(data.role);
      else setUserRole('customer');
      
      setLoading(false);
    };

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchRole(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchRole(currentUser.id);
      } else {
        setUserRole('customer'); // Reset on logout
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Provide the user, userRole, and logout function to the rest of the app
  return (
    <AuthContext.Provider value={{ user, userRole, handleLogout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook for easy access!
export const useAuth = () => useContext(AuthContext);