
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Star } from 'lucide-react';

type Merchant = Database['public']['Tables']['merchants']['Row'];

interface MerchantStatsProps {
  merchant: Merchant;
  themeColor?: string;
}

const MerchantStats = ({ merchant, themeColor }: MerchantStatsProps) => {
  const { data: customerCount, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customerCount', merchant.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('customer_merchant_link')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id);
      if (error) throw error;
      return count;
    }
  });

  const { data: visitsData, isLoading: isLoadingVisits } = useQuery({
    queryKey: ['visitsData', merchant.id],
    queryFn: async () => {
       const { data, error } = await supabase
        .from('visits')
        .select('points_earned')
        .eq('merchant_id', merchant.id);
      if (error) throw error;
      return data;
    }
  });

  const isLoading = isLoadingCustomers || isLoadingVisits;

  const totalVisits = visitsData?.length ?? 0;
  const totalPoints = visitsData?.reduce((acc, visit) => acc + visit.points_earned, 0) ?? 0;

  // Définir un background léger pastel basé sur la couleur personnalisée
  const pastelBg = themeColor
    ? `${themeColor}18`
    : "#6366f118";

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card
        className="rounded-2xl shadow-lg border-0"
        style={{ background: pastelBg }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle
            className="text-base font-semibold"
            style={themeColor ? { color: themeColor } : undefined}
          >
            Clients fidèles
          </CardTitle>
          <Users className="h-5 w-5" style={themeColor ? { color: themeColor } : undefined} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold" style={themeColor ? { color: themeColor } : undefined}>
            {isLoading ? '...' : customerCount}
          </div>
        </CardContent>
      </Card>
      <Card
        className="rounded-2xl shadow-lg border-0"
        style={{ background: pastelBg }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle
            className="text-base font-semibold"
            style={themeColor ? { color: themeColor } : undefined}
          >
            Visites enregistrées
          </CardTitle>
          <ShoppingCart className="h-5 w-5" style={themeColor ? { color: themeColor } : undefined} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold" style={themeColor ? { color: themeColor } : undefined}>
            {isLoading ? '...' : totalVisits}
          </div>
        </CardContent>
      </Card>
      <Card
        className="rounded-2xl shadow-lg border-0"
        style={{ background: pastelBg }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle
            className="text-base font-semibold"
            style={themeColor ? { color: themeColor } : undefined}
          >
            Points distribués
          </CardTitle>
          <Star className="h-5 w-5" style={themeColor ? { color: themeColor } : undefined} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold" style={themeColor ? { color: themeColor } : undefined}>
            {isLoading ? '...' : totalPoints}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantStats;
