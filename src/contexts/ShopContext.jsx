import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { fetchUserWishlistAPI, updateWishlistAPI } from '../services/wishlistApi';
import { fetchUserCartAPI, syncCartItemAPI, removeFromCartAPI, clearCartAPI } from '../services/cartApi';

const ShopContext = createContext({});

const GUEST_CART_KEY = 'klscents_guest_cart';

const readGuestCart = () => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeGuestCart = (items) => {
  try {
    const slim = items.map(({ id, name, brand, price, size, image_urls, gender, notes, available, compare_at_price, quantity, variant_id }) => ({
      id, name, brand, price, size, image_urls, gender, notes, available, compare_at_price, quantity, variant_id,
    }));
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(slim));
  } catch { }
};

const clearGuestCart = () => {
  try { localStorage.removeItem(GUEST_CART_KEY); } catch { }
};

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const [wishItems, dbCart] = await Promise.all([
            fetchUserWishlistAPI(user.id),
            fetchUserCartAPI(user.id),
          ]);
          setWishlistItems(wishItems);

          const guestCart = readGuestCart();
          if (guestCart.length > 0) {
            clearGuestCart();
            const merged = [...dbCart];
            
            // ✨ OPTIMIZED: Parallel Cart Syncing
            const syncPromises = [];
            
            for (const guestItem of guestCart) {
              const existing = merged.find(i => i.id === guestItem.id && i.variant_id === guestItem.variant_id);
              if (existing) {
                existing.quantity += guestItem.quantity;
              } else {
                merged.push(guestItem);
              }
              const finalQty = existing ? existing.quantity : guestItem.quantity;
              
              // Push the network request to an array instead of awaiting it here
              syncPromises.push(syncCartItemAPI(user.id, guestItem.id, finalQty, guestItem.variant_id));
            }
            
            setCartItems(merged);
            
            // Fire them all at once
            try {
               await Promise.all(syncPromises);
            } catch (err) {
               console.error('Merge sync error', err);
            }

          } else {
            setCartItems(dbCart);
          }
        } catch (error) {
          console.error("Failed to load user data", error);
        }
      };
      loadUserData();
    } else {
      setWishlistItems([]);
      setCartItems(readGuestCart());
    }
  }, [user]);

  useEffect(() => {
    if (!user) writeGuestCart(cartItems);
  }, [cartItems, user]);

  const showToast = (title, message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const addToCart = async (product, quantity = 1, silent = false) => {
    let finalQuantity = quantity;

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.variant_id === product.variant_id);
      if (existing) {
        finalQuantity = existing.quantity + quantity;
        return prev.map(item => (item.id === product.id && item.variant_id === product.variant_id) ? { ...item, quantity: finalQuantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });

    if (!silent) showToast("Added to Cart", `${product.name} (${product.size}) is now in your bag.`);

    if (user) {
      try {
        await syncCartItemAPI(user.id, product.id, finalQuantity, product.variant_id);
      } catch (error) {
        console.error("Cart sync error", error);
      }
    }
  };

  const updateQuantity = async (index, delta) => {
    const item = cartItems[index];
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    setCartItems(prev => prev.map((p, i) => i === index ? { ...p, quantity: newQuantity } : p));

    if (user) {
      try {
        await syncCartItemAPI(user.id, item.id, newQuantity, item.variant_id);
      } catch (error) {
        console.error("Cart sync error", error);
      }
    }
  };

  const removeFromCart = async (index, silent = false) => {
    const itemToRemove = cartItems[index];

    setCartItems(prev => prev.filter((_, i) => i !== index));
    if (!silent) showToast("Removed", "Item removed from cart.", "info");

    if (user && itemToRemove) {
      try {
        await removeFromCartAPI(user.id, itemToRemove.id, itemToRemove.variant_id);
      } catch (error) {
        console.error("Cart sync error", error);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    clearGuestCart();
    if (user) {
      try {
        await clearCartAPI(user.id);
      } catch (error) {
        console.error("Cart sync error", error);
      }
    }
  };

  const toggleWishlist = async (product, silent = false) => {
    const isSaved = wishlistItems.some(item => item.id === product.id);

    try {
      if (isSaved) {
        setWishlistItems(prev => prev.filter(item => item.id !== product.id));
        if (!silent) showToast("Removed", `${product.name} removed from wishlist.`, "info");
        if (user) await updateWishlistAPI(user.id, product.id, false);
      } else {
        setWishlistItems(prev => [...prev, product]);
        if (!silent) showToast("Saved", `${product.name} saved to wishlist.`);
        if (user) await updateWishlistAPI(user.id, product.id, true);
      }
    } catch (error) {
      console.error("Wishlist error", error);
      if (!silent) showToast("Error", "Could not update wishlist.", "error");
    }
  };

  return (
    <ShopContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      wishlistItems, toggleWishlist,
      toasts, showToast, removeToast,
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);