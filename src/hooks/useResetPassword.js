import { useState, useEffect } from 'react';
import { updatePasswordAPI, getSessionAPI, logoutAPI } from '../services/authApi';
import { useShop } from '../contexts/ShopContext';
import { useNavigate } from 'react-router-dom';

export const useResetPassword = () => {
  const { showToast } = useShop();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      const { data: { session } } = await getSessionAPI();
      
      // If there is an active session, they are cleared to reset the password
      if (session?.user) {
        setIsAuthorized(true);
      } else {
        // ✨ Boot them back to HOME if they try to manually visit /reset-password
        navigate('/', { replace: true });
      }
      setVerifyingSession(false);
    };
    verifyAccess();
  }, [navigate]);

  const submitNewPassword = async (formData) => {
    setError('');
    setSuccess(false);

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }

    // ✨ Strict Password Validation: At least 8 chars AND 1 number
    const passwordRegex = /^(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long and contain at least one number.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await updatePasswordAPI(formData.password);
      setSuccess(true);
      if (showToast) showToast('Success!', 'Your password has been updated. Please log in again.');
      
      // Force logout so they must use the new credentials
      await logoutAPI();
      
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return { submitNewPassword, isLoading, error, setError, success, isAuthorized, verifyingSession };
};