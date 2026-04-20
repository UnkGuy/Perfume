import React from 'react';
import { Check, X, Star, Loader2 } from 'lucide-react';
import { useAdminReviews } from '../../hooks/useReviews';
import { useShop } from '../../contexts/ShopContext';

const AdminReviews = () => {
  const { pendingReviews, isLoading, updateReviewStatus } = useAdminReviews();
  const { showToast } = useShop();

  const handleAction = async (id, status) => {
    try {
      await updateReviewStatus(id, status);
      showToast('Success', `Review has been ${status}.`);
    } catch (err) {
      showToast('Error', 'Failed to update review status', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-gold-400" size={32} />
      </div>
    );
  }

  if (!pendingReviews || pendingReviews.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
        <Star size={48} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl text-white font-medium mb-2">All caught up!</h3>
        <p className="text-gray-400">There are no pending reviews to moderate at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingReviews.map(review => (
        <div key={review.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-gold-400 font-bold text-lg">{review.products?.name || 'Unknown Product'}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < review.rating ? 'fill-gold-400 text-gold-400' : 'fill-gray-700 text-gray-700'} />
                ))}
              </div>
            </div>
            <p className="text-gray-300 mb-2">"{review.comment}"</p>
            <p className="text-xs text-gray-500">Submitted: {new Date(review.created_at).toLocaleDateString()}</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => handleAction(review.id, 'approved')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500 hover:text-black rounded transition-colors"
            >
              <Check size={18} /> Accept
            </button>
            <button 
              onClick={() => handleAction(review.id, 'rejected')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white rounded transition-colors"
            >
              <X size={18} /> Deny
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminReviews;