
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, Star } from 'lucide-react';

type Merchant = Database['public']['Tables']['merchants']['Row'];

interface MerchantStatsProps {
  merchant: Merchant;
}

const MerchantStats = ({ merchant }: MerchantStatsProps) => {
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

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clients fidèles</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : customerCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Visites enregistrées</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : totalVisits}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Points distribués</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : totalPoints}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantStats;
