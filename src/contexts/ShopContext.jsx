import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserWishlistAPI, updateWishlistAPI } from '../services/wishlistApi';

const ShopContext = createContext({});

export const ShopProvider = ({ children }) => {
  const { user } = useAuth(); 
  
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [toasts, setToasts] = useState([]);

  // --- DATABASE SYNC ---
  useEffect(() => {
    if (user) {
      const loadWishlist = async () => {
        try {
          const items = await fetchUserWishlistAPI(user.id);
          setWishlistItems(items);
        } catch (error) {
          console.error("Failed to load wishlist", error);
        }
      };
      loadWishlist();
    } else {
      setWishlistItems([]); 
    }
  }, [user]);

  // --- TOAST LOGIC ---
  const showToast = (title, message, type = 'success') => {
    const id = crypto.randomUUID(); 
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(toast => toast.id !== id));

  // --- CART LOGIC ---
  const addToCart = (product) => {
    setCartItems(prev => [...prev, product]);
    showToast("Added to Cart", `${product.name} is now in your bag.`);
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
    showToast("Removed", "Item removed from cart.", "error");
  };

  const clearCart = () => setCartItems([]);

  // --- WISHLIST LOGIC ---
  const toggleWishlist = async (product) => {
    const isSaved = wishlistItems.some(item => item.id === product.id);

    try {
      if (isSaved) {
        setWishlistItems(prev => prev.filter(item => item.id !== product.id));
        showToast("Removed", `${product.name} removed from wishlist.`, "error");
        if (user) await updateWishlistAPI(user.id, product.id, false);
      } else {
        setWishlistItems(prev => [...prev, product]);
        showToast("Saved", `${product.name} saved to wishlist.`);
        if (user) await updateWishlistAPI(user.id, product.id, true);
      }
    } catch (error) {
      console.error("Wishlist error", error);
      showToast("Error", "Could not update wishlist.", "error");
    }
  };

  return (
    <ShopContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, clearCart, 
      wishlistItems, toggleWishlist, 
      toasts, showToast, removeToast 
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);