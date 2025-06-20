
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRewards = (merchantId: string | null) => {
  return useQuery({
    queryKey: ['rewards', merchantId],
    queryFn: async () => {
      if (!merchantId) return [];
      
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('points_required');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
