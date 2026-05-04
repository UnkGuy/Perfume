import { useState } from 'react';
import { loginAPI, registerAPI, resetPasswordAPI, fetchUserRoleAPI, signInWithOAuthAPI } from '../services/authApi';
import { useShop } from '../contexts/ShopContext';
import { useUI } from '../contexts/UIContext';
import { useSettings } from '../contexts/SettingsContext';

export const useAuthForm = () => {
  const { showToast } = useShop();
  const { setCurrentPage } = useUI();
  const { settings } = useSettings(); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const submitAuth = async (view, formData, setView, captchaToken) => {
    setError('');

    const email = formData.email?.trim();
    const password = formData.password;

    if (!email || (view !== 'forgot' && !password)) {
      setError('Please fill in all required fields.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (view === 'register') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return false;
      }
      
      if (!/\d/.test(password)) {
        setError('Password must contain at least one number.');
        return false;
      }

      if (password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }

      // ✨ Consent check
      if (settings.legal?.showLegalPages && !formData.consent) {
        setError('You must agree to the Terms & Conditions and Privacy Policy to create an account.');
        return false;
      }
    }
    

    if ((view === 'register' || view === 'login') && !captchaToken) {
      setError('Please complete the captcha verification.');
      return false;
    }

    setIsLoading(true);

    try {
      if (view === 'register') {
        await registerAPI(email, password, captchaToken);
        if (showToast) showToast('Success', 'Account created! Please check your email to verify.');
        setView('login'); 
        
      } else if (view === 'login') {
        const data = await loginAPI(email, password, captchaToken);
        const role = await fetchUserRoleAPI(data.user?.id);
        
        if (showToast) showToast('Welcome Back', 'Successfully logged in.');
        setCurrentPage(role === 'admin' ? 'admin' : 'products');
        
      } else if (view === 'forgot') {
        await resetPasswordAPI(email);
        setView('check-email');
      }
      return true;
    } catch (err) {
      let message = err.message;
      
      if (message.includes('Invalid login')) {
         message = 'Invalid email or password. Did you originally sign up with Google or Facebook?';
      } else if (message.includes('over the email rate limit')) {
         message = 'Too many requests. Please wait a moment and try again.';
      } else if (message.includes('already registered') || message.toLowerCase().includes('already in use')) {
         message = 'This email is already in use. Please sign in instead.';
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