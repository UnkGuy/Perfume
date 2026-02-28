import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

// 1. Create the Context
const AuthContext = createContext({});

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Provide the user and logout function to the rest of the app
  return (
    <AuthContext.Provider value={{ user, handleLogout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook for easy access!
export const useAuth = () => useContext(AuthContext);