import { useState } from 'react';
import { updatePasswordAPI } from '../services/authApi';

export const useResetPassword = (showToast, setCurrentPage) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submitNewPassword = async (formData) => {
    setError('');
    setSuccess(false);

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in both fields.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
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
      if (showToast) showToast('Success!', 'Your password has been updated. You can now log in.');
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return { submitNewPassword, isLoading, error, setError, success };
};