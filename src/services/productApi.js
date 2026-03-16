import { supabase } from './supabase'; // Adjust path if needed

export const fetchProductsAPI = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const saveProductAPI = async (payload, id = null) => {
  if (id) {
    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('products').insert([payload]);
    if (error) throw error;
  }
};

export const deleteProductAPI = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};