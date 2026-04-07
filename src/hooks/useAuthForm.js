import { useState } from 'react';
import { loginAPI, registerAPI, resetPasswordAPI, fetchUserRoleAPI, signInWithOAuthAPI } from '../services/authApi';
import { useShop } from '../contexts/ShopContext';
import { useUI } from '../contexts/UIContext';

export const useAuthForm = () => {
  const { showToast } = useShop();
  const { setCurrentPage } = useUI();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const submitAuth = async (view, formData, setView) => {
    setError('');

    // Edge case: Empty spaces bypass empty string checks
    const email = formData.email?.trim();
    const password = formData.password;
    const username = formData.username?.trim();

    if (!email || (view !== 'forgot' && !password)) {
      setError('Please fill in all required fields.');
      return false;
    }

    if (view === 'register') {
      if (!username) {
        setError('Please provide a username.');
        return false;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return false;
      }
      if (password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
    }

    setIsLoading(true);

    try {
      if (view === 'register') {
        await registerAPI(email, password, username);
        if (showToast) showToast('Success', 'Account created! Please check your email to verify.');
        setView('login'); 
        
      } else if (view === 'login') {
        const data = await loginAPI(email, password);
        const role = await fetchUserRoleAPI(data.user?.id);
        
        if (showToast) showToast('Welcome Back', 'Successfully logged in.');
        setCurrentPage(role === 'admin' ? 'admin' : 'products');
        
      } else if (view === 'forgot') {
        await resetPasswordAPI(email);
        if (showToast) showToast('Email Sent', 'Check your inbox for the reset link.');
        setView('login');
      }
      return true;
    } catch (err) {
      // Edge case: User-friendly error messaging
      const message = err.message.includes('Invalid login') 
        ? 'Invalid email or password.' 
        : err.message;
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setError('');
    setIsLoading(true); // Prevent multi-clicks
    try {
      await signInWithOAuthAPI(provider);
      // Browser will redirect automatically, no need to set isLoading to false
    } catch (err) {
      setError(err.message || `Failed to sign in with ${provider}.`);
      setIsLoading(false);
    }
  };

  return { submitAuth, handleOAuthSignIn, isLoading, error, setError };
};