
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCustomerData = (customerId: string | null) => {
  return useQuery({
    queryKey: ['customer-data', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, email, client_code, birth_date')
        .eq('id', customerId)
        .single();

      if (profileError) throw profileError;

      const { data: merchantLinks, error: linksError } = await supabase
        .from('customer_merchant_link')
        .select(`
          loyalty_points,
          merchant_id,
          merchants (
            id,
            name,
            theme_color,
            logo_url
          )
        `)
        .eq('customer_id', customerId);

      if (linksError) throw linksError;

      return {
        profile,
        merchantLinks: merchantLinks || []
      };
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
