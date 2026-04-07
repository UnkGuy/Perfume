import { useState, useEffect } from 'react';
import { fetchUserProfileAPI, updateUserProfileAPI } from '../services/userApi';
import { resetPasswordAPI } from '../services/authApi'; // ✨ Changed import
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';

export const useProfile = (activeTab) => {
  const { user } = useAuth();
  const { showToast } = useShop();

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
      // 1. Update basic profile info
      await updateUserProfileAPI(user.id, profileData);

      // 2. Handle Password Change Request via Email Link
      if (passwords.newPassword) {
         // We ignore the newPassword string entirely and force an email confirmation flow
         await resetPasswordAPI(user.email);
         if (showToast) {
             showToast(
                 "Profile Updated", 
                 "Your details were saved. A confirmation email has been sent to change your password."
             );
         }
      } else {
         if (showToast) showToast("Success", "Profile updated successfully.");
      }
      
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