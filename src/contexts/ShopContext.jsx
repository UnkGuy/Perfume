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
    // Store only the fields we need — don't persist ephemeral UI state
    const slim = items.map(({ id, name, brand, price, size, image_urls, gender, notes, available, compare_at_price, quantity }) => ({
      id, name, brand, price, size, image_urls, gender, notes, available, compare_at_price, quantity,
    }));
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(slim));
  } catch { /* storage full — fail silently */ }
};

const clearGuestCart = () => {
  try { localStorage.removeItem(GUEST_CART_KEY); } catch { /* ignore */ }
};

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [toasts, setToasts] = useState([]);

  // --- DATABASE / LOCALSTORAGE SYNC ---
  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        try {
          const [wishItems, dbCart] = await Promise.all([
            fetchUserWishlistAPI(user.id),
            fetchUserCartAPI(user.id),
          ]);
          setWishlistItems(wishItems);

          // ← Merge guest cart into DB cart on login
          const guestCart = readGuestCart();
          if (guestCart.length > 0) {
            clearGuestCart();
            // Merge: for each guest item, add to DB cart if not already there
            const merged = [...dbCart];
            for (const guestItem of guestCart) {
              const existing = merged.find(i => i.id === guestItem.id);
              if (existing) {
                existing.quantity += guestItem.quantity;
              } else {
                merged.push(guestItem);
              }
              // Persist the merged quantity to DB
              try {
                const finalQty = existing ? existing.quantity : guestItem.quantity;
                await syncCartItemAPI(user.id, guestItem.id, finalQty);
              } catch (err) {
                console.error('Merge sync error for item', guestItem.id, err);
              }
            }
            setCartItems(merged);
          } else {
            setCartItems(dbCart);
          }
        } catch (error) {
          console.error("Failed to load user data", error);
        }
      };
      loadUserData();
    } else {
      // Guest: load from localStorage
      setWishlistItems([]);
      setCartItems(readGuestCart());
    }
  }, [user]);

  // Keep localStorage in sync for guests whenever cartItems changes
  useEffect(() => {
    if (!user) writeGuestCart(cartItems);
  }, [cartItems, user]);

  // --- TOAST LOGIC ---
  const showToast = (title, message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // --- CART LOGIC ---
  const addToCart = async (product, quantity = 1) => {
    let finalQuantity = quantity;

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        finalQuantity = existing.quantity + quantity;
        return prev.map(item => item.id === product.id ? { ...item, quantity: finalQuantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });

    showToast("Added to Cart", `${product.name} is now in your bag.`);

    if (user) {
      try {
        await syncCartItemAPI(user.id, product.id, finalQuantity);
      } catch (error) {
        console.error("Cart sync error", error);
      }
    }
    // If guest: the useEffect above will persist to localStorage automatically
  };

  const updateQuantity = async (index, delta) => {
    const item = cartItems[index];
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    setCartItems(prev => prev.map((p, i) => i === index ? { ...p, quantity: newQuantity } : p));

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

    setCartItems(prev => prev.filter((_, i) => i !== index));
    showToast("Removed", "Item removed from cart.", "error");

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
    clearGuestCart();
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
      toasts, showToast, removeToast,
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);