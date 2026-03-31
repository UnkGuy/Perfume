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
        // 1. Log the user in and get their data
        const data = await loginAPI(formData.email, formData.password);
        
        // 2. Instantly check if they are an admin
        const role = await fetchUserRoleAPI(data.user.id);
        
        if (showToast) showToast('Welcome Back', 'Successfully logged in.');
        
        // 3. Route them to the correct page!
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

  return { submitAuth, isLoading, error, setError };
};