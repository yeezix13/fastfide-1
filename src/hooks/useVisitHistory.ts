
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVisitHistory = (customerId?: string, merchantId?: string) => {
  return useQuery({
    queryKey: ['visit-history', customerId, merchantId],
    queryFn: async () => {
      let query = supabase
        .from('visits')
        .select(`
          id,
          amount_spent,
          points_earned,
          points_spent,
          created_at,
          merchants (
            name,
            theme_color
          )
        `)
        .order('created_at', { ascending: false });

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
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });
};
