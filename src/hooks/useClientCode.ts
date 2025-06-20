
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useClientCode = (customerId: string | null) => {
  return useQuery({
    queryKey: ['client-code', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('client_code, first_name, last_name')
        .eq('id', customerId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
    staleTime: 10 * 60 * 1000, // 10 minutes cache pour les codes clients
  });
};

export const useCustomerByClientCode = (clientCode: string | null) => {
  return useQuery({
    queryKey: ['customer-by-code', clientCode],
    queryFn: async () => {
      if (!clientCode) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, email, client_code')
        .eq('client_code', clientCode)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!clientCode,
    staleTime: 5 * 60 * 1000,
  });
};
