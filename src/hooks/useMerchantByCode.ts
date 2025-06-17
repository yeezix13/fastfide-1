
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMerchantByCode = (merchantCode: string | null) => {
  return useQuery({
    queryKey: ['merchant', merchantCode],
    queryFn: async () => {
      if (!merchantCode) return null;
      const { data, error } = await supabase
        .from('merchants')
        .select('id, name, theme_color')
        .eq('signup_code', merchantCode)
        .maybeSingle();
      
      if (error || !data) {
        throw new Error('Commerçant introuvable. Veuillez vérifier le lien.');
      }
      
      return data;
    },
    enabled: !!merchantCode,
  });
};
