// src/services/settingsApi.js 
import { supabase } from './supabase';

export const DEFAULT_SETTINGS = { 
  features: { reviews: true, wishlist: true, promoCodes: true, guestCheckout: true, chatWidget: true, ratingsDisplay: true, reorderButton: true, }, 
  paymentMethods: ['GCash', 'Bank Transfer', 'Cash on Hand'], 
  fulfillmentMethods: ['Delivery', 'Meetup', 'Store Pickup'], 
  storeInfo: { 
    name: 'KL Scents', 
    tagline: 'Experience luxury in every drop.', 
    storeLogo: 'https://zmewzupojoufgryrskrs.supabase.co/storage/v1/object/public/assets-images/kl%20scents%20logo.jpg',
    instagramUrl: 'https://www.instagram.com/klscentsph', 
    facebookUrl: 'https://www.facebook.com/profile.php?id=61568097239499', 
    contactEmail: '', 
    contactPhone: '', 
  }, 
  checkout: { 
    minOrderAmount: 0, 
    maxCartItems: 20, 
    spamLimitSeconds: 60, 
  }, 
  inventory: {
    lowStockThreshold: 10, // Added threshold setting
  },
  announcement: { 
    enabled: false, 
    text: 'Free Shipping Nationwide • Artisan Crafted • Extrait de Parfum', 
    bgColor: '#d4af37', 
    textColor: '#000000', 
  },
  welcomeImages: {
    hero: [],
    secondary: []
  }
};

function deepMerge(defaults, overrides) { 
  const result = { ...defaults }; 
  for (const key in overrides) { 
    if ( overrides[key] !== null && typeof overrides[key] === 'object' && !Array.isArray(overrides[key]) ) { 
      result[key] = deepMerge(defaults[key] || {}, overrides[key]); 
    } else { 
      result[key] = overrides[key]; 
    } 
  } 
  return result; 
}

export const fetchSettingsAPI = async () => { 
  const { data, error } = await supabase 
    .from('site_settings') 
    .select('settings') 
    .eq('id', 1) 
    .maybeSingle();

  if (error) throw error; 
  if (data?.settings) return deepMerge(DEFAULT_SETTINGS, data.settings); 
  return DEFAULT_SETTINGS; 
};

export const saveSettingsAPI = async (settings) => { 
  const { data, error } = await supabase 
    .from('site_settings') 
    .upsert({ id: 1, settings, updated_at: new Date().toISOString() })
    .select(); 

  if (error) throw error; 
  
  if (!data || data.length === 0) {
    throw new Error("Action blocked by database security. Are you sure you are an admin?");
  }
};