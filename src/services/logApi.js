import { supabase } from './supabase';

export const logAdminActionAPI = async (adminEmail, action, targetItem) => {
  // If useAuth hasn't loaded yet, adminEmail might be undefined
  if (!adminEmail) {
    console.warn("Log attempted without admin email");
    return;
  }

  const { data, error } = await supabase
    .from('admin_logs')
    .insert([
      { 
        admin_email: adminEmail, 
        action: action, 
        target_item: String(targetItem) // Ensure it's a string
      }
    ]);

  if (error) {
    console.error("Supabase Log Error:", error.message, error.details);
  }
};