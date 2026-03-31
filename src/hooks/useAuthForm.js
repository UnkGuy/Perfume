import { useState } from 'react';
import { loginAPI, registerAPI, resetPasswordAPI, fetchUserRoleAPI } from '../services/authApi';

export const useAuthForm = (showToast, setCurrentPage) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const submitAuth = async (view, formData, setView) => {
    setError('');

    if (!formData.email || (view !== 'forgot' && !formData.password)) {
      setError('Please fill in all required fields.');
      return false;
    }

    // ✨ NEW: Enforce 8 characters ONLY on registration ✨
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
        await registerAPI(formData.email, formData.password);
        if (showToast) showToast('Success', 'Account created! You are now logged in.');
        setCurrentPage('products');
        
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
      // ✨ Supabase will automatically throw "User already registered" here! ✨
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { submitAuth, isLoading, error, setError };
};