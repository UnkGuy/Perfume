import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductsAPI, saveProductAPI, deleteProductAPI } from '../services/productApi';

export const useProducts = () => {
  const queryClient = useQueryClient();

  // 1. FETCH PRODUCTS (Same as the storefront!)
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProductsAPI,
  });

  // 2. SAVE PRODUCT MUTATION
  const saveMutation = useMutation({
    mutationFn: ({ payload, id }) => saveProductAPI(payload, id),
    onSuccess: () => {
      // Tell the cache to refresh the 'products' list instantly
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // 3. DELETE PRODUCT MUTATION
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProductAPI(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Helper functions to expose to your UI
  const saveProduct = async (payload, id = null) => {
    await saveMutation.mutateAsync({ payload, id });
  };

  const deleteProduct = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  return { 
    products: products || [], 
    isLoading, 
    saveProduct, 
    deleteProduct 
  };
};