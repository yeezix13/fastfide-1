
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMerchantByCode = (merchantCode: string | null) => {
  return useQuery({
    queryKey: ['merchant', merchantCode],
    queryFn: async () => {
      if (!merchantCode) return null;
      const { data, error } = await supabase
        .from('merchants')
        .select('id, name, theme_color, logo_url, address, phone, contact_email')
        .eq('signup_code', merchantCode)
        .maybeSingle();
      
      if (error || !data) {
        throw new Error('Commerçant introuvable. Veuillez vérifier le lien.');
      }
      
      return data;
    },
    enabled: !!merchantCode,
    staleTime: 10 * 60 * 1000, // 10 minutes cache pour les données merchant
    retry: 2,
  });
};

// Hook pour obtenir les statistiques du commerçant
export const useMerchantStats = (merchantId: string | null) => {
  return useQuery({
    queryKey: ['merchant-stats', merchantId],
    queryFn: async () => {
      if (!merchantId) return null;
      
      // Récupérer le nombre de clients
      const { count: customerCount } = await supabase
        .from('customer_merchant_link')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchantId);

      // Récupérer le nombre de visites ce mois
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count: monthlyVisits } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchantId)
        .gte('created_at', startOfMonth.toISOString());

      // Récupérer le chiffre d'affaires total
      const { data: totalRevenue } = await supabase
        .from('visits')
        .select('amount_spent')
        .eq('merchant_id', merchantId);

      const revenue = totalRevenue?.reduce((sum, visit) => sum + Number(visit.amount_spent), 0) || 0;

      return {
        customerCount: customerCount || 0,
        monthlyVisits: monthlyVisits || 0,
        totalRevenue: revenue
      };
    },
    enabled: !!merchantId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache pour les stats
  });
};
