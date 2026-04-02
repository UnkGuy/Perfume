import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllPromosAPI, createPromoAPI, deletePromoAPI } from '../services/promoApi';
import { logAdminActionAPI } from '../services/logApi'; 
import { useAuth } from '../contexts/AuthContext';

export const usePromos = (showToast) => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get the logged-in admin!

  // 1. Fetch Promos
  const { data: promos, isLoading } = useQuery({
    queryKey: ['promos'],
    queryFn: fetchAllPromosAPI,
  });

  // 2. Create Promo Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => createPromoAPI(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['promos'] });
      if (showToast) showToast('Success', `Promo code ${variables.code} created!`);
      
      // ✨ LOG THE ACTION ✨
      logAdminActionAPI(user?.email, 'Created Promo Code', variables.code);
    },
    onError: () => {
      if (showToast) showToast('Error', 'Could not create code. Ensure it is unique.', 'error');
    }
  });

  // 3. Delete Promo Mutation
  const deleteMutation = useMutation({
    // Passing an object so we can access codeString in onSuccess for the log
    mutationFn: ({ id }) => deletePromoAPI(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['promos'] });
      if (showToast) showToast('Deleted', `Promo code ${variables.codeString} removed.`);
      
      // ✨ LOG THE ACTION ✨
      logAdminActionAPI(user?.email, 'Deleted Promo Code', variables.codeString);
    },
    onError: () => {
      if (showToast) showToast('Error', 'Failed to delete promo code.', 'error');
    }
  });

  // Wrapper functions
  const createPromo = async (payload) => await createMutation.mutateAsync(payload);
  const deletePromo = async (id, codeString) => await deleteMutation.mutateAsync({ id, codeString });

  return { 
    promos: promos || [], 
    isLoading, 
    // If you are using React Query v5, use isPending. If v4, use isLoading.
    isAdding: createMutation.isPending || createMutation.isLoading, 
    createPromo, 
    deletePromo 
  };
};