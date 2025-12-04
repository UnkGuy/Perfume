// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, MOCK_MESSAGES, APP_ROUTES } from '../utils/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- Navigation State ---
  const [currentPage, setCurrentPage] = useState('welcome');

  // --- User / Auth State ---
  const [user, setUser] = useState(() => {
    // Check localStorage for remembered user
    const savedUser = localStorage.getItem('klscents_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const isAuthenticated = !!user;

  // --- Data State ---
  const [products, setProducts] = useState(PRODUCTS);
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('klscents_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [notifications, setNotifications] = useState([]);

  // --- Filters State ---
  const [filters, setFilters] = useState({
    category: [],
    availability: [],
    priceRange: [0, 500],
    brands: [],
    searchQuery: ''
  });
  const [sortBy, setSortBy] = useState('featured');

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('klscents_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- Notification System ---
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // --- Auth Logic ---
  const login = (email, password, rememberMe = false) => {
    if (email === 'admin@klscents.ph' && password === 'admin') {
      const userData = { name: 'KL Admin', email, role: 'admin' };
      setUser(userData);
      if (rememberMe) {
        localStorage.setItem('klscents_user', JSON.stringify(userData));
      }
      setCurrentPage('admin');
      addNotification('Welcome back, Admin!', 'success');
      return { success: true };
    } else if (email === 'demo@klscents.ph' && password === 'demo123') {
      const userData = { name: 'Demo User', email, role: 'customer' };
      setUser(userData);
      if (rememberMe) {
        localStorage.setItem('klscents_user', JSON.stringify(userData));
      }
      setCurrentPage('products');
      addNotification('Login successful!', 'success');
      return { success: true };
    } else if (email && password) {
      const userData = { name: 'Valued Customer', email, role: 'customer' };
      setUser(userData);
      if (rememberMe) {
        localStorage.setItem('klscents_user', JSON.stringify(userData));
      }
      setCurrentPage('products');
      addNotification('Login successful!', 'success');
      return { success: true };
    }
    addNotification('Invalid credentials', 'error');
    return { success: false, message: 'Invalid credentials' };
  };

  const loginAsGuest = () => {
    const guestUser = { name: 'Guest', email: 'guest@klscents.ph', role: 'guest' };
    setUser(guestUser);
    setCurrentPage('products');
    addNotification('Browsing as guest', 'info');
  };

  const logout = () => {
    setUser(null);
    setCartItems([]);
    localStorage.removeItem('klscents_user');
    localStorage.removeItem('klscents_cart');
    setCurrentPage('welcome');
    addNotification('Logged out successfully', 'info');
  };

  // --- Cart Logic ---
  const addToCart = (product) => {
    if (!product.available) {
      addNotification("Sorry, this item is currently unavailable.", 'error');
      return;
    }
    
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        addNotification(`Updated ${product.name} quantity`, 'success');
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      addNotification(`${product.name} added to cart!`, 'success');
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    const item = cartItems.find(i => i.id === productId);
    setCartItems(prev => prev.filter(item => item.id !== productId));
    if (item) {
      addNotification(`${item.name} removed from cart`, 'info');
    }
  };

  const updateCartQuantity = (productId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
    addNotification('Cart cleared', 'info');
  };

  // --- Product Management (Admin) ---
  const updateProduct = (productId, updates) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, ...updates } : p
    ));
    addNotification('Product updated successfully', 'success');
  };

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    addNotification('Product deleted', 'info');
  };

  const addProduct = (newProduct) => {
    const product = {
      ...newProduct,
      id: products.length + 1,
    };
    setProducts(prev => [...prev, product]);
    addNotification('Product added successfully', 'success');
  };

  // --- Filters & Search ---
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      category: [],
      availability: [],
      priceRange: [0, 500],
      brands: [],
      searchQuery: ''
    });
  };

  const getFilteredProducts = () => {
    let filtered = [...products];

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.notes.some(note => note.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(p => filters.category.includes(p.category));
    }

    // Availability filter
    if (filters.availability.length > 0) {
      if (filters.availability.includes('available') && !filters.availability.includes('out-of-stock')) {
        filtered = filtered.filter(p => p.available);
      } else if (filters.availability.includes('out-of-stock') && !filters.availability.includes('available')) {
        filtered = filtered.filter(p => !p.available);
      }
    }

    // Price range filter
    filtered = filtered.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(p => filters.brands.includes(p.brand));
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        // featured - no change
        break;
    }

    return filtered;
  };

  // --- Messages ---
  const sendMessage = (text) => {
    const newMessage = {
      id: messages.length + 1,
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
    
    setMessages(prev => [...prev, newMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "Thank you for your message! Our team will get back to you shortly. 😊",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  // Derived State
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Helper to determine if nav should be hidden
  const currentRouteConfig = APP_ROUTES.find(r => r.id === currentPage);
  const shouldHideNav = currentRouteConfig ? currentRouteConfig.hideNav : false;

  return (
    <AppContext.Provider value={{
      // State
      currentPage,
      user,
      isAuthenticated,
      products,
      cartItems,
      messages,
      cartTotal,
      cartCount,
      notifications,
      filters,
      sortBy,
      APP_ROUTES,
      shouldHideNav,
      
      // Actions
      setCurrentPage,
      login,
      loginAsGuest,
      logout,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      updateProduct,
      deleteProduct,
      addProduct,
      updateFilters,
      resetFilters,
      getFilteredProducts,
      setSortBy,
      sendMessage,
      addNotification,
      removeNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};