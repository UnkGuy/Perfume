import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const UIContext = createContext({});

export const UIProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Trick: derive currentPage from the URL so existing components don't break
  const currentPage = location.pathname === '/' ? 'welcome' : location.pathname.substring(1);

  // Trick: Map the old state setter to the new router
  const setCurrentPage = (page) => {
    if (page === 'welcome') {
      navigate('/');
    } else {
      navigate(`/${page}`);
    }
  };

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme logic remains unchanged
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('klscents_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('klscents_theme', theme);
    } catch { /* ignore */ }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <UIContext.Provider value={{
      currentPage, setCurrentPage,
      isCartOpen, setIsCartOpen,
      isWishlistOpen, setIsWishlistOpen,
      searchQuery, setSearchQuery,
      theme, toggleTheme,
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);