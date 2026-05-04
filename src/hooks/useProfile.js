import { useState, useEffect } from 'react';
import { fetchUserProfileAPI, updateUserProfileAPI } from '../services/userApi';
import { resetPasswordAPI, logoutAPI, getUserIdentitiesAPI, unlinkOAuthIdentityAPI, linkOAuthIdentityAPI } from '../services/authApi'; 
import { useAuth } from '../contexts/AuthContext';
import { useShop } from '../contexts/ShopContext';

export const useProfile = (activeTab) => {
  const { user } = useAuth();
  const { showToast } = useShop();

  const [profileData, setProfileData] = useState({ 
    phone_number: '',
    address: { region: '', province: '', city: '', barangay: '', street: '', landmark: '' }
  });
  
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [identities, setIdentities] = useState([]);
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    if (user && activeTab === 'settings') {
      const loadData = async () => {
        setIsProfileLoading(true);
        try {
          const data = await fetchUserProfileAPI(user.id);
          if (data) {
            let parsedAddress = { region: '', province: '', city: '', barangay: '', street: '', landmark: '' };
            if (data.address) {
              try { parsedAddress = JSON.parse(data.address); } 
              catch (e) { parsedAddress.street = data.address; }
            }
            setProfileData({
              phone_number: data.phone_number || '',
              address: parsedAddress
            });
          }

          const userIdentities = await getUserIdentitiesAPI();
          setIdentities(userIdentities);

        } catch (err) {
          console.error("Failed to load profile data", err);
        } finally {
          setIsProfileLoading(false);
        }
      };
      loadData();
    }
  }, [user, activeTab]);

  const validateForm = () => {
    const newErrors = {};
    if (profileData.phone_number) {
      const phPhoneRegex = /^(09|\+639)\d{9}$/;
      if (!phPhoneRegex.test(profileData.phone_number.trim())) {
        newErrors.phone_number = "Please enter a valid PH number.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProfile = async () => {
    if (!validateForm()) {
      if (showToast) showToast("Error", "Please fix the errors in the form.", "error");
      return false;
    }

    setIsSaving(true);
    try {
      await updateUserProfileAPI(user.id, {
        phone_number: profileData.phone_number,
        address: JSON.stringify(profileData.address)
      });

      if (showToast) showToast("Success", "Profile updated successfully.");
      
      return true;
    } catch (err) {
      if (showToast) showToast("Error", err.message, "error");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordResetRequest = async (email) => {
    try {
      await resetPasswordAPI(email);
      if (showToast) showToast("Check Your Email", "A secure password reset link has been sent. You have been safely logged out.", "success");
      await logoutAPI();
    } catch (err) {
      if (showToast) showToast("Error", err.message || "Failed to send reset link.", "error");
    }
  };

  const handleLinkIdentity = async (provider) => {
    setIsLinking(true);
    try {
      await linkOAuthIdentityAPI(provider);
    } catch (err) {
      if (showToast) showToast("Connection Failed", err.message, "error");
      setIsLinking(false);
    }
  };

  const handleUnlinkIdentity = async (provider) => {
    const identityToUnlink = identities.find(id => id.provider === provider);
    if (!identityToUnlink) return;

    if (identities.length <= 1) {
      if (showToast) showToast("Action Blocked", "You cannot disconnect your only login method.", "error");
      return;
    }

    try {
      await unlinkOAuthIdentityAPI(identityToUnlink);
      setIdentities(identities.filter(id => id.provider !== provider));
      if (showToast) showToast("Account Disconnected", `Successfully unlinked ${provider}.`, "success");
    } catch (err) {
      if (showToast) showToast("Error", "Could not unlink account.", "error");
    }
  };

  const handleAddressChange = (e) => {
    setProfileData(prev => ({ ...prev, address: { ...prev.address, [e.target.name]: e.target.value } }));
  };

  return { 
    profileData, setProfileData, handleAddressChange, isProfileLoading, isSaving, 
    saveProfile, errors, identities, handleLinkIdentity, handleUnlinkIdentity, isLinking,
    handlePasswordResetRequest 
  };
};