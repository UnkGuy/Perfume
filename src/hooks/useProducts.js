import { useState, useEffect } from 'react';
import { fetchAllProducts, deleteProduct } from '../services/productApi';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeProduct = async (id) => {
    await deleteProduct(id);
    await loadProducts(); // Refresh list after deleting
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return { products, isLoading, removeProduct, refreshProducts: loadProducts };
};