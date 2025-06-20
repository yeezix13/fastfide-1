import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerLoyaltyInfoCard from '@/components/customer/CustomerLoyaltyInfoCard';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, ShoppingBag } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';
import RewardsDisplay from '@/components/customer/RewardsDisplay';
import { useRewards } from '@/hooks/useRewards';

const CustomerMerchantDetails = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        navigate('/customer');
      }
    };
    getUserId();
  }, [navigate]);
  
  const { data: merchantData, isLoading: isLoadingMerchant } = useQuery({
    queryKey: ['merchantDetails', merchantId],
    queryFn: async () => {
      if (!merchantId) return null;
      const { data, error } = await supabase
        .from('merchants')
        .select('id, name, theme_color, logo_url, address, phone, contact_email')
        .eq('id', merchantId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!merchantId,
  });

  const { data: loyaltyData, isLoading: isLoadingLoyalty } = useQuery({
    queryKey: ['loyaltyPoints', userId, merchantId],
    queryFn: async () => {
      if (!userId || !merchantId) return null;
      const { data, error } = await supabase
        .from('customer_merchant_link')
        .select('loyalty_points')
        .eq('customer_id', userId)
        .eq('merchant_id', merchantId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!merchantId,
  });

  const { data: visitHistory, isLoading: isLoadingVisits } = useQuery({
    queryKey: ['visits', userId, merchantId],
    queryFn: async () => {
      if (!userId || !merchantId) return null;
      const { data, error } = await supabase
        .from('visits')
        .select('created_at, amount_spent, points_earned')
        .eq('customer_id', userId)
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!merchantId,
  });
  
  const { data: rewards } = useRewards(merchantId);

  if (isLoadingMerchant || isLoadingLoyalty) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  if (!merchantData) {
    return <div className="flex h-screen items-center justify-center">Commerçant introuvable.</div>;
  }

  return (
    <>
      <Helmet>
        <title>{merchantData?.name} - Mes points de fidélité</title>
      </Helmet>
      <div className="container mx-auto p-4 md:p-8">
        {/* En-tête avec le bouton de retour */}
        <header className="flex items-center justify-between py-4">
          <div>
            <Button variant="ghost" asChild>
              <Link to="/customer-dashboard">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
          </div>
        </header>

        <main className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Carte d'informations sur la fidélité */}
            <CustomerLoyaltyInfoCard
              points={loyaltyData?.loyalty_points || 0}
              merchantInfo={merchantData}
              themeColor={merchantData?.theme_color}
            />
            
            {/* Nouveau composant pour les récompenses */}
            <RewardsDisplay 
              rewards={rewards || []}
              currentPoints={loyaltyData?.loyalty_points || 0}
              themeColor={merchantData?.theme_color}
            />
          </div>

          <div>
            {/* Historique des visites */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Historique récent
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingVisits ? (
                  <p>Chargement de l'historique...</p>
                ) : visitHistory && visitHistory.length > 0 ? (
                  <ul className="space-y-3">
                    {visitHistory.map((visit) => (
                      <li key={visit.created_at} className="border rounded-md p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">
                              {formatDate(visit.created_at)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {visit.amount_spent ? `Dépense: ${visit.amount_spent}€` : 'Utilisation de points'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {visit.points_earned > 0 ? `+${visit.points_earned}` : `-${visit.points_earned}`} points
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <ShoppingBag className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune visite récente.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default CustomerMerchantDetails;
