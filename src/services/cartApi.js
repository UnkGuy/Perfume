import { supabase } from './supabase';

export const fetchUserCartAPI = async (userId) => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      product_id,
      variant_id,
      products ( id, name, brand, gender, notes, available, image_urls, description ),
      product_variants ( id, size, price, compare_at_price, stock_count, image_url )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error("Supabase Cart Fetch Error:", error);
    throw error;
  }

  // Safely flatten the data so the cart component gets a clean object
  return data.map(item => {
    const p = Array.isArray(item.products) ? item.products[0] : item.products;
    const v = Array.isArray(item.product_variants) ? item.product_variants[0] : item.product_variants;

    if (!p || !v) return null;

    return {
      ...p,
      // Overwrite base details with specific variant details
      variant_id: v.id,
      size: v.size,
      price: Number(v.price),
      compare_at_price: v.compare_at_price ? Number(v.compare_at_price) : null,
      stock_count: v.stock_count,
      image_urls: v.image_url ? [v.image_url] : p.image_urls,
      // Retain cart quantities
      quantity: item.quantity,
      cart_item_id: item.id
    };
  }).filter(Boolean); // removes any null items
};

export const syncCartItemAPI = async (userId, productId, quantity, variantId) => {
  if (!variantId) throw new Error("Variant ID is required to sync cart items.");

  const { data: existing, error: fetchErr } = await supabase
    .from('cart_items')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('variant_id', variantId)
    .maybeSingle();

  if (fetchErr) throw fetchErr;

  if (existing) {
    const { error: updateErr } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', existing.id);
    if (updateErr) throw updateErr;
  } else {
    const { error: insertErr } = await supabase
      .from('cart_items')
      .insert([{ user_id: userId, product_id: productId, quantity, variant_id: variantId }]);
    if (insertErr) throw insertErr;
  }
};

export const removeFromCartAPI = async (userId, productId, variantId) => {
   const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('variant_id', variantId); // strictly require variant_id now

  if (error) throw error;
};

export const clearCartAPI = async (userId) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
};