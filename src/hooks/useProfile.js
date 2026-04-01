import { useState, useEffect } from 'react';
import { fetchUserProfileAPI, updateUserProfileAPI } from '../services/userApi';
import { updatePasswordAPI } from '../services/authApi';

export const useProfile = (user, activeTab, showToast) => {
  const [profileData, setProfileData] = useState({ username: '', address: '', phone_number: '' });
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'settings') {
      const loadProfile = async () => {
        setIsProfileLoading(true);
        try {
          const data = await fetchUserProfileAPI(user.id);
          if (data) {
            setProfileData({
              username: data.username || '',
              address: data.address || '',
              phone_number: data.phone_number || ''
            });
          }
        } catch (err) {
          console.error("Failed to load profile", err);
        } finally {
          setIsProfileLoading(false);
        }
      };
      loadProfile();
    }
  }, [user, activeTab]);

  const saveProfile = async (passwords) => {
    setIsSaving(true);
    try {
      await updateUserProfileAPI(user.id, profileData);

      if (passwords.newPassword) {
        if (passwords.newPassword.length < 8) throw new Error("New password must be at least 8 characters.");
        if (passwords.newPassword !== passwords.confirmPassword) throw new Error("Passwords do not match.");
        await updatePasswordAPI(passwords.newPassword);
      }

      if (showToast) showToast("Success", "Profile updated successfully.");
      return true;
    } catch (err) {
      if (showToast) showToast("Error", err.message, "error");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { profileData, setProfileData, isProfileLoading, isSaving, saveProfile };
};