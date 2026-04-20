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

    const email = formData.email?.trim();
    const password = formData.password;
    const username = formData.username?.trim();

    // Basic existence check
    if (!email || (view !== 'forgot' && !password)) {
      setError('Please fill in all required fields.');
      return false;
    }

    // Strict Email Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (view === 'register') {
      if (!username) {
        setError('Please provide a username.');
        return false;
      }
      
      // Strict Password Validation: At least 8 chars AND 1 number
      const passwordRegex = /^(?=.*[0-9]).{8,}$/;
      if (!passwordRegex.test(password)) {
        setError('Password must be at least 8 characters long and contain at least one number.');
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
        
        // ✨ Switch the UI directly to the check email screen!
        setView('check-email');
      }
      return true;
    } catch (err) {
      let message = err.message;
      
      if (message.includes('Invalid login')) {
         message = 'Invalid email or password. Did you originally sign up with Google or Facebook?';
      }
      if (message.includes('over the email rate limit')) {
         message = 'Too many requests. Please wait a moment and try again.';
      }
      
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithOAuthAPI(provider);
    } catch (err) {
      setError(err.message || `Failed to sign in with ${provider}.`);
      setIsLoading(false);
    }
  };

  return { submitAuth, handleOAuthSignIn, isLoading, error, setError };
};