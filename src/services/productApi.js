import { supabase } from './supabase';

export const fetchProductsAPI = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const saveProductAPI = async (payload, id = null) => {
  const { variants, ...productData } = payload;
  let productId = id;

  if (id) {
    const { error } = await supabase.from('products').update(productData).eq('id', id);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from('products').insert([productData]).select().single();
    if (error) throw error;
    productId = data.id;
  }

  // Get existing variants
  const { data: existingVariants } = await supabase.from('product_variants').select('id').eq('product_id', productId);
  const existingIds = existingVariants?.map(v => v.id) || [];
  
  // Find which ones to keep vs delete
  const incomingIds = variants.map(v => v.id).filter(Boolean);
  const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));

  // Delete removed variants
  if (idsToDelete.length > 0) {
    await supabase.from('product_variants').delete().in('id', idsToDelete);
  }

  // Upsert (Update existing, Insert new)
  if (variants && variants.length > 0) {
    const variantsToUpsert = variants.map(v => ({
      ...(v.id ? { id: v.id } : {}), // Preserve UUID if it already exists
      product_id: productId,
      size: v.size,
      price: v.price,
      compare_at_price: v.compare_at_price || null,
      stock_count: v.stock_count || null,
      image_url: v.image_url || null
    }));
    
    const { error: varError } = await supabase.from('product_variants').upsert(variantsToUpsert);
    if (varError) throw varError;
  }
};

export const deleteProductAPI = async (id) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
};