import React, { createContext, useState, useContext, useEffect } from 'react';

const UIContext = createContext({});

export const UIProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ← Theme: 'dark' | 'light' — persisted in localStorage
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('klscents_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply/remove the 'dark' class on <html> whenever theme changes
  // This lets Tailwind's dark: variants work across the whole app.
  // tailwind.config.js must have: darkMode: 'class'
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