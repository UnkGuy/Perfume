import { supabase } from './supabase';

export const fetchProductsAPI = async () => {
  const { data, error } = await supabase
    .from('products')
    // We now fetch the reviews alongside the products to dynamically calculate ratings
    .select('*, product_variants(*), reviews(*)')
    .eq('is_deleted', false) // Soft delete filter added here
    .order('created_at', { ascending: false });
    
  if (error) throw error;

  // Process the rating on the fly so it's always accurate across the whole app!
  return data.map(product => {
    const approvedReviews = (product.reviews || []).filter(r => r.status === 'approved');
    const avgRating = approvedReviews.length > 0
      ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
      : 0;

    return {
      ...product,
      rating: avgRating, 
    };
  });
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

  const { data: existingVariants } = await supabase.from('product_variants').select('id').eq('product_id', productId);
  const existingIds = existingVariants?.map(v => v.id) || [];
  
  const incomingIds = variants.map(v => v.id).filter(Boolean);
  const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));

  // Instead of deleting the variants, we soft delete them as well if they are removed in the UI
  if (idsToDelete.length > 0) {
    await supabase.from('product_variants').update({ is_deleted: true }).in('id', idsToDelete);
  }

  if (variants && variants.length > 0) {
    const variantsToUpsert = variants.map(v => ({
      ...(v.id ? { id: v.id } : {}),
      product_id: productId,
      size: v.size,
      price: v.price,
      compare_at_price: v.compare_at_price || null,
      stock_count: v.stock_count || null,
      image_url: v.image_url || null,
      is_deleted: false // Make sure re-added or new ones are not marked as deleted
    }));
    
    const { error: varError } = await supabase.from('product_variants').upsert(variantsToUpsert);
    if (varError) throw varError;
  }
};

export const deleteProductAPI = async (id) => {
  // Soft Delete: update is_deleted to true and make it unavailable
  const { error } = await supabase.from('products').update({ is_deleted: true, available: false }).eq('id', id);
  if (error) throw error;
};