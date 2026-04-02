import React, { createContext, useState, useContext } from 'react';

const UIContext = createContext({});

export const UIProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <UIContext.Provider value={{ 
      currentPage, setCurrentPage,
      isCartOpen, setIsCartOpen,
      isWishlistOpen, setIsWishlistOpen,
      searchQuery, setSearchQuery
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);