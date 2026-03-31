import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase'; // <-- ADD THIS IMPORT

// Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard'; // <--- NEW IMPORT
import ResetPasswordPage from './pages/ResetPasswordPage'; // <-- IMPORT THE NEW PAGE

// Components
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import Toast from './components/Toast'; 
import ChatWidget from './components/ChatWidget';

// 1. Import our custom hooks!
import { useAuth } from './contexts/AuthContext';
import { useShop } from './contexts/ShopContext';

function App() {
  // --- UI STATES ---
  const [currentPage, setCurrentPage] = useState('welcome');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false); 
  const [searchQuery, setSearchQuery] = useState(''); 

  // 2. Simply grab all our logic from the invisible Context clouds!
  const { user, userRole, handleLogout } = useAuth(); // <--- GRAB USER ROLE HERE
  const { 
  cartItems, addToCart, removeFromCart, clearCart,
  wishlistItems, toggleWishlist, 
  toasts, showToast, removeToast 
} = useShop();

  // --- PASSWORD RESET HANDLING ---
  // This effect listens for the password recovery event from Supabase Auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentPage('reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- GUEST ACCESS CONTROL ---
  // This function checks if a user is logged in before allowing an action.
  // If not logged in, it redirects them to the login page.
  const handleRestrictedAction = (action) => {
    if (!user) {
      showToast('Login Required', 'You need to be logged in to perform this action.', 'info');
      setCurrentPage('login');
    } else {
      action();
    }
  };

  // Layout toggles
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const toggleWishlistDrawer = () => setIsWishlistOpen(!isWishlistOpen);

  // --- PAGE ROUTER ---
  const renderCurrentPage = () => {
    const commonProps = { 
      setCurrentPage, cartItems, wishlistItems, 
      onCartClick: toggleCart, onWishlistClick: toggleWishlistDrawer, 
      searchQuery, setSearchQuery, showToast, 
      user, userRole, // <--- PASS DOWN TO COMPONENTS
      handleLogout: async () => {
        await handleLogout();
        showToast('Logged Out', 'You have been successfully logged out.');
        setCurrentPage('welcome');
      }
    };
    
switch (currentPage) {
      case 'welcome': return <WelcomePage {...commonProps} />;
      // Pass the handleRestrictedAction to the ProductPage
      case 'products': return <ProductPage {...commonProps} addToCart={(item) => handleRestrictedAction(() => addToCart(item))} toggleWishlist={toggleWishlist} />;
      case 'cart': return <CartPage {...commonProps} removeFromCart={removeFromCart} clearCart={clearCart} />;
      case 'login': return <LoginPage setCurrentPage={setCurrentPage} showToast={showToast} />;
      // Protect the profile page
      case 'profile':
        if (!user) {
          showToast('Login Required', 'You need to be logged in to view your profile.', 'info');
          return <LoginPage setCurrentPage={setCurrentPage} showToast={showToast} />;
        }
        return <ProfilePage {...commonProps} />;
      
      // NEW: Add the route for the reset password page
      case 'reset-password':
        return <ResetPasswordPage 
          setCurrentPage={setCurrentPage} 
          showToast={showToast}
          onPasswordUpdate={() => setCurrentPage('login')} // Redirect to login on success
        />;

      // 1. If the user is an admin, show the admin dashboard. Otherwise, redirect to the welcome page.
      case 'admin':
        if (userRole === 'admin') {
          return <AdminDashboard {...commonProps} />;
        }
        // Redirect non-admins to the welcome page
        showToast('Unauthorized', 'You do not have permission to access this page.', 'error');
        return <WelcomePage {...commonProps} />;
          
      default: return <WelcomePage {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-rich-black text-white font-sans">
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* --- ADMIN-ONLY BUTTON --- */}
      {/* This button is only visible to users with the 'admin' role. */}
      {/* It provides a secure way to access the admin dashboard. */}
      {userRole === 'admin' && (
        <button
          onClick={() => setCurrentPage('admin')}
          className="fixed bottom-6 left-6 z-[100] bg-green-500 text-white px-4 py-2 rounded-md font-bold shadow-lg hover:bg-green-600 transition-colors"
        >
          Go to Admin Dashboard
        </button>
      )}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems} 
        removeFromCart={removeFromCart} 
        setCurrentPage={setCurrentPage} 
        // --- ADD THESE NEW PROPS ---
        user={user}
        showToast={showToast}
        // NEW: Use handleRestrictedAction for checkout
        onCheckout={() => handleRestrictedAction(() => {
          // In a real app, you'd navigate to a checkout page.
          // For now, we'll just show a toast.
          showToast('Success', 'Proceeding to checkout!');
          setIsCartOpen(false); // Close the drawer
          // setCurrentPage('checkout'); // Example of navigating to a checkout page
        })}
      />
      
      <WishlistDrawer 
        isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} 
        wishlistItems={wishlistItems} toggleWishlist={toggleWishlist} addToCart={addToCart} 
      />

      {/* Hide ChatWidget for admins so it doesn't get in the way of their dashboard */}
      {userRole !== 'admin' && <ChatWidget user={user} />}

      {renderCurrentPage()}
    </div>
  );
}

export default App;