import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchProductsAPI, saveProductAPI, deleteProductAPI } from '../services/productApi';
import { logAdminActionAPI } from '../services/logApi';
import { useAuth } from '../contexts/AuthContext';

export const useProducts = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProductsAPI,
  });

  // Listen for the custom event fired by the bulk availability update in AdminProducts.
  useEffect(() => {
    const handler = () => queryClient.invalidateQueries({ queryKey: ['products'] });
    window.addEventListener('klscents:products-updated', handler);
    return () => window.removeEventListener('klscents:products-updated', handler);
  }, [queryClient]);

  const saveMutation = useMutation({
    mutationFn: ({ payload, id }) => saveProductAPI(payload, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      const actionType = variables.id ? 'Edited Product' : 'Added New Product';
      logAdminActionAPI(user?.email, actionType, variables.payload.name);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProductAPI(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      logAdminActionAPI(user?.email, 'Deleted Product', `Product ID: ${id}`);
    },
  });

  const saveProduct   = async (payload, id = null) => await saveMutation.mutateAsync({ payload, id });
  const deleteProduct = async (id) => await deleteMutation.mutateAsync(id);

  return { products: products || [], isLoading, saveProduct, deleteProduct };
};