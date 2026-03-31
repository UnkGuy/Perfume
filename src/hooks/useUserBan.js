import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserBanStatusAPI, toggleUserBanAPI } from '../services/userApi';
import { logAdminActionAPI } from '../services/logApi';
import { useAuth } from '../contexts/AuthContext';

export const useUserBan = (targetUserId, showToast) => {
  const queryClient = useQueryClient();
  const { user: adminUser } = useAuth();

  const { data: isBanned, isLoading } = useQuery({
    queryKey: ['userBan', targetUserId],
    queryFn: () => fetchUserBanStatusAPI(targetUserId),
    enabled: !!targetUserId,
  });

  const banMutation = useMutation({
    mutationFn: (newBanStatus) => toggleUserBanAPI(targetUserId, newBanStatus),
    onSuccess: (_, newBanStatus) => {
      queryClient.invalidateQueries({ queryKey: ['userBan', targetUserId] });
      if (showToast) showToast('Success', newBanStatus ? 'User blocked.' : 'User unblocked.');
      
      // Log the Ban/Unban
      const actionType = newBanStatus ? 'Blocked User' : 'Unblocked User';
      logAdminActionAPI(adminUser?.email, actionType, `User ID: ${targetUserId}`);
    },
  });

  const toggleBan = async (newBanStatus) => await banMutation.mutateAsync(newBanStatus);

  return { isBanned, isLoading, toggleBan };
};