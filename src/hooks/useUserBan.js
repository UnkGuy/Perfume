import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserBanStatusAPI, toggleUserBanAPI } from '../services/userApi';

export const useUserBan = (userId, showToast) => {
  const queryClient = useQueryClient();

  const { data: isBanned, isLoading } = useQuery({
    queryKey: ['userBan', userId],
    queryFn: () => fetchUserBanStatusAPI(userId),
    enabled: !!userId,
  });

  const banMutation = useMutation({
    mutationFn: (newBanStatus) => toggleUserBanAPI(userId, newBanStatus),
    onSuccess: (_, newBanStatus) => {
      queryClient.invalidateQueries({ queryKey: ['userBan', userId] });
      if (showToast) showToast('Success', newBanStatus ? 'User has been blocked.' : 'User has been unblocked.');
    },
    onError: () => {
      if (showToast) showToast('Error', 'Failed to update user status.', 'error');
    }
  });

  const toggleBan = async (newBanStatus) => {
    await banMutation.mutateAsync(newBanStatus);
  };

  return { isBanned, isLoading, toggleBan };
};