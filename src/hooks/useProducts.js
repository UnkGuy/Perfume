import { useState, useEffect, useCallback } from 'react';
import { fetchProductsAPI, saveProductAPI, deleteProductAPI } from '../services/productApi';

export const useProducts = (showToast) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchProductsAPI();
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      if (showToast) showToast('Error', 'Could not load products', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const saveProduct = async (payload, id = null) => {
    await saveProductAPI(payload, id);
    await loadProducts(); // Refresh list automatically
  };

  const deleteProduct = async (id) => {
    await deleteProductAPI(id);
    await loadProducts(); // Refresh list automatically
  };

  return { products, isLoading, saveProduct, deleteProduct };
};