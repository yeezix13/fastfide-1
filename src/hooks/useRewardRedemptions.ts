
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRewardRedemptions = (customerId?: string, merchantId?: string) => {
  return useQuery({
    queryKey: ['reward-redemptions', customerId, merchantId],
    queryFn: async () => {
      let query = supabase
        .from('reward_redemptions')
        .select(`
          id,
          points_spent,
          redeemed_at,
          rewards (
            name,
            points_required
          ),
          merchants (
            name,
            theme_color
          )
        `)
        .order('redeemed_at', { ascending: false });

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }
      
      if (merchantId) {
        query = query.eq('merchant_id', merchantId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!(customerId || merchantId),
    staleTime: 2 * 60 * 1000,
  });
};
