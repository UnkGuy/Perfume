import { supabase } from './supabase';

export const logAdminActionAPI = async (adminEmail, action, targetItem) => {
  if (!adminEmail) return; // Safety check
  const { error } = await supabase.from('admin_logs').insert([{
    admin_email: adminEmail,
    action: action,
    target_item: targetItem
  }]);
  if (error) console.error("Failed to log admin action:", error);
};