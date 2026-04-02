import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserWishlistAPI, updateWishlistAPI } from '../services/wishlistApi';
import { fetchUserCartAPI, syncCartItemAPI, removeFromCartAPI, clearCartAPI } from '../services/cartApi';

const ShopContext = createContext({});

export const ShopProvider = ({ children }) => {
  const { user } = useAuth(); 
  
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [toasts, setToasts] = useState([]);

  // --- DATABASE SYNC ---
  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const wishItems = await fetchUserWishlistAPI(user.id);
          setWishlistItems(wishItems);
          
          const dbCart = await fetchUserCartAPI(user.id);
          setCartItems(dbCart);
        } catch (error) {
          console.error("Failed to load user data", error);
        }
      };
      loadUserData();
    } else {
      setWishlistItems([]); 
      setCartItems([]); // Clears cart UI on logout!
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
  const addToCart = async (product, quantity = 1) => {
    let finalQuantity = quantity;

    // Optimistic UI Update
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        finalQuantity = existing.quantity + quantity;
        return prev.map(item => item.id === product.id ? { ...item, quantity: finalQuantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
    
    showToast("Added to Cart", `${product.name} is now in your bag.`);

    // Database Sync
    if (user) {
      try {
        await syncCartItemAPI(user.id, product.id, finalQuantity);
      } catch (error) {
        console.error("Cart sync error", error);
      }
    }
  };

  const updateQuantity = async (index, delta) => {
    const item = cartItems[index];
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    // Optimistic UI Update
    setCartItems(prev => prev.map((p, i) => i === index ? { ...p, quantity: newQuantity } : p));

    // Database Sync
    if (user) {
      try {
        await syncCartItemAPI(user.id, item.id, newQuantity);
      } catch (error) {
        console.error("Cart sync error", error);
      }
    }
  };

  const removeFromCart = async (index) => {
    const itemToRemove = cartItems[index];
    
    // Optimistic UI Update
    setCartItems(prev => prev.filter((_, i) => i !== index));
    showToast("Removed", "Item removed from cart.", "error");

    // Database Sync
    if (user && itemToRemove) {
      try {
        await removeFromCartAPI(user.id, itemToRemove.id);
      } catch (error) {
        console.error("Cart sync error", error);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user) {
      try {
        await clearCartAPI(user.id);
      } catch (error) {
        console.error("Cart sync error", error);
      }
    }
  };

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
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, 
      wishlistItems, toggleWishlist, 
      toasts, showToast, removeToast 
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);