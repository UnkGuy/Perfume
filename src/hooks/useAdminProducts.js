import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProductsAPI, saveProductAPI, deleteProductAPI } from '../services/productApi';
import { logAdminActionAPI } from '../services/logApi'; // <-- Import API
import { useAuth } from '../contexts/AuthContext';      // <-- Import Auth

export const useProducts = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get the admin user

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProductsAPI,
  });

  const saveMutation = useMutation({
    mutationFn: ({ payload, id }) => saveProductAPI(payload, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Log Add or Edit
      const actionType = variables.id ? 'Edited Product' : 'Added New Product';
      logAdminActionAPI(user?.email, actionType, variables.payload.name);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProductAPI(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Log Deletion
      logAdminActionAPI(user?.email, 'Deleted Product', `Product ID: ${id}`);
    },
  });

  const saveProduct = async (payload, id = null) => await saveMutation.mutateAsync({ payload, id });
  const deleteProduct = async (id) => await deleteMutation.mutateAsync(id);

  return { products: products || [], isLoading, saveProduct, deleteProduct };
};