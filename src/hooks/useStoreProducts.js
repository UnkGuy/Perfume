import { useState, useEffect } from 'react';
import { fetchProductsAPI } from '../services/productApi'; // Reusing the admin API!

export const useStoreProducts = (showToast) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProductsAPI();
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        if(showToast) showToast("Error", "Could not load products. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [showToast]);

  return { products, isLoading };
};