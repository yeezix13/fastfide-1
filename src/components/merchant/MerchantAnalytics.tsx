
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Euro, Gift } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MerchantAnalyticsProps {
  merchantId: string;
  themeColor?: string;
}

const MerchantAnalytics: React.FC<MerchantAnalyticsProps> = ({ 
  merchantId, 
  themeColor = "#2563eb" 
}) => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['merchant-analytics', merchantId],
    queryFn: async () => {
      // Récupérer les visites des 7 derniers jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: visits } = await supabase
        .from('visits')
        .select('created_at, amount_spent, points_earned')
        .eq('merchant_id', merchantId)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Récupérer les rachats de récompenses
      const { data: redemptions } = await supabase
        .from('reward_redemptions')
        .select('redeemed_at, points_spent, rewards(name)')
        .eq('merchant_id', merchantId)
        .gte('redeemed_at', sevenDaysAgo.toISOString());

      // Récupérer le nombre total de clients
      const { count: totalCustomers } = await supabase
        .from('customer_merchant_link')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchantId);

      // Traiter les données pour les graphiques
      const dailyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        const dayVisits = visits?.filter(v => 
          v.created_at.startsWith(dateStr)
        ) || [];
        
        return {
          date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          visits: dayVisits.length,
          revenue: dayVisits.reduce((sum, v) => sum + Number(v.amount_spent), 0),
          points: dayVisits.reduce((sum, v) => sum + v.points_earned, 0)
        };
      });

      const rewardStats = redemptions?.reduce((acc: any, redemption) => {
        const rewardName = redemption.rewards?.name || 'Récompense inconnue';
        if (!acc[rewardName]) {
          acc[rewardName] = { name: rewardName, count: 0, points: 0 };
        }
        acc[rewardName].count += 1;
        acc[rewardName].points += redemption.points_spent;
        return acc;
      }, {});

      const rewardChartData = Object.values(rewardStats || {});

      return {
        dailyData,
        rewardChartData,
        totalVisits: visits?.length || 0,
        totalRevenue: visits?.reduce((sum, v) => sum + Number(v.amount_spent), 0) || 0,
        totalRedemptions: redemptions?.length || 0,
        totalCustomers: totalCustomers || 0
      };
    },
    enabled: !!merchantId,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });

  if (isLoading) {
    return <div className="text-center py-8">Chargement des analytics...</div>;
  }

  const chartConfig = {
    visits: {
      label: "Visites",
      color: themeColor,
    },
    revenue: {
      label: "Chiffre d'affaires",
      color: themeColor,
    },
    points: {
      label: "Points distribués",
      color: themeColor,
    },
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visites (7j)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: themeColor }}>
              {analyticsData?.totalVisits || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: themeColor }}>
              {analyticsData?.totalCustomers || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA (7j)</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: themeColor }}>
              {(analyticsData?.totalRevenue || 0).toFixed(2)}€
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rachats (7j)</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: themeColor }}>
              {analyticsData?.totalRedemptions || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visites par jour</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <BarChart data={analyticsData?.dailyData || []}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="visits" fill={themeColor} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chiffre d'affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <LineChart data={analyticsData?.dailyData || []}>
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={themeColor} 
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Récompenses les plus populaires */}
      {analyticsData?.rewardChartData && (analyticsData.rewardChartData as any[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Récompenses populaires (7j)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(analyticsData.rewardChartData as any[]).map((reward, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{reward.name}</span>
                  <span className="font-medium" style={{ color: themeColor }}>
                    {reward.count} fois
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MerchantAnalytics;
