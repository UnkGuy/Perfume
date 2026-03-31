import { useQuery } from '@tanstack/react-query';
import { fetchProductsAPI } from '../services/productApi'; 

export const useStoreProducts = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products'],           // The unique "name" for this cache
    queryFn: fetchProductsAPI,        // The service function to call
    staleTime: 1000 * 60 * 5,         // Keep data fresh for 5 minutes without hitting Supabase
  });

  return { 
    products: data || [], 
    isLoading, 
    isError 
  };
};