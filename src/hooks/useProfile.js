import { useState, useEffect } from 'react';
import { fetchUserProfileAPI, updateUserProfileAPI } from '../services/userApi';
import { resetPasswordAPI } from '../services/authApi'; 
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';

export const useProfile = (activeTab) => {
  const { user } = useAuth();
  const { showToast } = useShop();

  const [profileData, setProfileData] = useState({ 
    username: '', 
    phone_number: '',
    address: {
      region: '',
      province: '',
      city: '',
      barangay: '',
      street: '', // Block, Lot, House No., Street, Subdivision
      landmark: '' // Very helpful for PH deliveries
    }
  });
  
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && activeTab === 'settings') {
      const loadProfile = async () => {
        setIsProfileLoading(true);
        try {
          const data = await fetchUserProfileAPI(user.id);
          if (data) {
            // Parse the address if it was saved as JSON, otherwise fallback gracefully
            let parsedAddress = { region: '', province: '', city: '', barangay: '', street: '', landmark: '' };
            if (data.address) {
              try {
                parsedAddress = JSON.parse(data.address);
              } catch (e) {
                // If they had an old single-string address, dump it in the street field
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

// ... existing imports ...
  const validateForm = () => {
    const newErrors = {};
    
    // 1. Phone Validation
    if (profileData.phone_number) {
      const phPhoneRegex = /^(09|\+639)\d{9}$/;
      if (!phPhoneRegex.test(profileData.phone_number.trim())) {
        newErrors.phone_number = "Please enter a valid PH number (e.g., 09123456789 or +639123456789)";
      }
    }

    // 2. Address Edge Cases
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
// ... rest of the hook stays exactly the same ...

  const saveProfile = async (passwords) => {
    if (!validateForm()) {
      if (showToast) showToast("Error", "Please fix the errors in the form.", "error");
      return false;
    }

    setIsSaving(true);
    try {
      // Stringify the address object to fit your existing 'text' DB column
      const payloadToSave = {
        username: profileData.username,
        phone_number: profileData.phone_number,
        address: JSON.stringify(profileData.address)
      };

      await updateUserProfileAPI(user.id, payloadToSave);

      if (passwords?.newPassword) {
         await resetPasswordAPI(user.email);
         if (showToast) showToast("Profile Updated", "Details saved. A password reset email has been sent.");
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

  const handleAddressChange = (e) => {
    setProfileData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [e.target.name]: e.target.value
      }
    }));
  };

  return { profileData, setProfileData, handleAddressChange, isProfileLoading, isSaving, saveProfile, errors };
};