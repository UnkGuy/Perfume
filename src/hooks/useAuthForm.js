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

    if (!formData.email || (view !== 'forgot' && !formData.password)) {
      setError('Please fill in all required fields.');
      return false;
    }

    if (view === 'register' && !formData.username?.trim()) {
      setError('Please provide a username.');
      return false;
    }

    if (view === 'register' && formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }

    if (view === 'register' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    setIsLoading(true);

    try {
      if (view === 'register') {
        await registerAPI(formData.email, formData.password, formData.username);
        if (showToast) showToast('Success', 'Account created! Please check your email to verify.');
        setView('login'); 
        
      } else if (view === 'login') {
        const data = await loginAPI(formData.email, formData.password);
        const role = await fetchUserRoleAPI(data.user.id);
        
        if (showToast) showToast('Welcome Back', 'Successfully logged in.');
        setCurrentPage(role === 'admin' ? 'admin' : 'products');
        
      } else if (view === 'forgot') {
        await resetPasswordAPI(formData.email);
        if (showToast) showToast('Email Sent', 'Check your inbox for the reset link.');
        setView('login');
      }
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setError('');
    try {
      await signInWithOAuthAPI(provider);
      // Browser will redirect automatically
    } catch (err) {
      setError(err.message || `Failed to sign in with ${provider}.`);
    }
  };

  return { submitAuth, handleOAuthSignIn, isLoading, error, setError };
};