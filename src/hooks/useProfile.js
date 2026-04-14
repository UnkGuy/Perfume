import { useState, useEffect } from 'react';
import { fetchUserProfileAPI, updateUserProfileAPI } from '../services/userApi';
import { loginAPI, updatePasswordAPI } from '../services/authApi'; 
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';

export const useProfile = (activeTab) => {
  const { user } = useAuth();
  const { showToast } = useShop();

  const [profileData, setProfileData] = useState({ 
    username: '', 
    phone_number: '',
    address: {
      region: '', province: '', city: '', barangay: '', street: '', landmark: ''
    }
  });
  
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  // ✨ NEW: Track if the user already has a password identity
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'settings') {
      // Check Supabase's internal provider list
      const providers = user?.app_metadata?.providers || [];
      setHasPassword(providers.includes('email'));

      const loadProfile = async () => {
        setIsProfileLoading(true);
        try {
          const data = await fetchUserProfileAPI(user.id);
          if (data) {
            let parsedAddress = { region: '', province: '', city: '', barangay: '', street: '', landmark: '' };
            if (data.address) {
              try {
                parsedAddress = JSON.parse(data.address);
              } catch (e) {
                parsedAddress.street = data.address;
              }
            }
            setProfileData({
              username: data.username || '',
              phone_number: data.phone_number || '',
              address: parsedAddress
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

  const validateForm = () => {
    const newErrors = {};
    if (profileData.phone_number) {
      const phPhoneRegex = /^(09|\+639)\d{9}$/;
      if (!phPhoneRegex.test(profileData.phone_number.trim())) {
        newErrors.phone_number = "Please enter a valid PH number (e.g., 09123456789 or +639123456789)";
      }
    }
    if (profileData.address.region) {
      if (!profileData.address.street || profileData.address.street.trim().length < 5) {
        newErrors.street = "Street address is too short (min 5 characters).";
      }
      if (profileData.address.street && profileData.address.street.length > 150) {
        newErrors.street = "Street address is too long (max 150 characters).";
      }
      if (profileData.address.landmark && profileData.address.landmark.length > 150) {
        newErrors.landmark = "Landmark is too long (max 150 characters).";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfile = async (passwords) => {
    if (!validateForm()) {
      if (showToast) showToast("Error", "Please fix the errors in the form.", "error");
      return false;
    }

    setIsSaving(true);
    try {
      // 1. Update Profile Information
      const payloadToSave = {
        username: profileData.username,
        phone_number: profileData.phone_number,
        address: JSON.stringify(profileData.address)
      };
      await updateUserProfileAPI(user.id, payloadToSave);

      // 2. Handle Password Security
      if (passwords?.newPassword) {
        if (passwords.newPassword !== passwords.confirmPassword) {
            throw new Error("New passwords do not match.");
        }

        // If they DO have an email password, we MUST verify their current one to prevent tampering
        if (hasPassword) {
          if (!passwords.currentPassword) {
            throw new Error("Please enter your current password to authorize this change.");
          }
          try {
            await loginAPI(user.email, passwords.currentPassword);
          } catch (authErr) {
            throw new Error("Incorrect current password.");
          }
        }

        // ACTUAL PASSWORD UPDATE
        await updatePasswordAPI(passwords.newPassword);
        
        // ✨ NEW: Dynamic Feedback based on previous state
        if (!hasPassword) {
          if (showToast) showToast("Password Set!", "You can now use your email and this password to log in.", "success");
          setHasPassword(true); // Update local state so the UI adjusts immediately
        } else {
          if (showToast) showToast("Success", "Profile and password updated successfully.");
        }
      } else {
        // No password was entered, just a normal profile update
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

  const handleAddressChange = (e) => {
    setProfileData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [e.target.name]: e.target.value
      }
    }));
  };

  return { profileData, setProfileData, handleAddressChange, isProfileLoading, isSaving, saveProfile, errors, hasPassword };
};