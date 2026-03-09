import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext'; // It uses our Auth Context!

const ShopContext = createContext({});

export const ShopProvider = ({ children }) => {
  const { user } = useAuth(); // Grab the logged-in user
  
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [toasts, setToasts] = useState([]);

  // --- DATABASE SYNC ---
  useEffect(() => {
    if (user) {
      const fetchUserWishlist = async () => {
        const { data, error } = await supabase
          .from('wishlists')
          .select('product_id, products(*)')
          .eq('user_id', user.id);

        if (!error && data) {
          setWishlistItems(data.map(row => row.products));
        }
      };
      fetchUserWishlist();
    } else {
      setWishlistItems([]); // Clear on logout
    }
  }, [user]);

  // --- TOAST LOGIC ---
  const showToast = (title, message, type = 'success') => {
    const id = crypto.randomUUID(); 
    
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(toast => toast.id !== id));

  // --- CART & WISHLIST LOGIC ---
  const addToCart = (product) => {
    setCartItems(prev => [...prev, product]);
    showToast("Added to Cart", `${product.name} is now in your bag.`);
  };

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
    showToast("Removed", "Item removed from cart.", "error");
  };

  const clearCart = () => {
  setCartItems([]);
};

  const toggleWishlist = async (product) => {
    const isSaved = wishlistItems.some(item => item.id === product.id);

    if (isSaved) {
      setWishlistItems(prev => prev.filter(item => item.id !== product.id));
      showToast("Removed", `${product.name} removed from wishlist.`, "error");
      if (user) await supabase.from('wishlists').delete().match({ user_id: user.id, product_id: product.id });
    } else {
      setWishlistItems(prev => [...prev, product]);
      showToast("Saved", `${product.name} saved to wishlist.`);
      if (user) await supabase.from('wishlists').insert([{ user_id: user.id, product_id: product.id }]);
    }
  };

  return (
  <ShopContext.Provider value={{ 
    cartItems, addToCart, removeFromCart, clearCart, // <--- ADDED HERE
    wishlistItems, toggleWishlist, 
    toasts, showToast, removeToast 
  }}>
    {children}
  </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);