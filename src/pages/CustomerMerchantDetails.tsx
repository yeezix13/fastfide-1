
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import CustomerRewardsList from "@/components/customer/CustomerRewardsList";
import CustomerLoyaltyHistoryTable from "@/components/customer/CustomerLoyaltyHistoryTable";
import CustomerLoyaltyInfoCard from "@/components/customer/CustomerLoyaltyInfoCard";

const CustomerMerchantDetails = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    getUserSession();
  }, []);

  const { data: loyaltyAccount, isLoading: isLoadingAccount } = useQuery({
    queryKey: ['loyaltyAccount', user?.id, merchantId],
    queryFn: async () => {
      if (!user || !merchantId) return null;
      const { data, error } = await supabase
        .from('customer_merchant_link')
        .select(`
          loyalty_points,
          merchants (
            id,
            name,
            address,
            phone,
            contact_email
          )
        `)
        .eq('customer_id', user.id)
        .eq('merchant_id', merchantId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching loyalty account details:", error);
        throw error;
      }
      return data;
    },
    enabled: !!user && !!merchantId,
  });

  const { data: rewards, isLoading: isLoadingRewards } = useQuery({
    queryKey: ['rewards', merchantId],
    queryFn: async () => {
      if (!merchantId) return [];
      const { data, error } = await supabase
        .from('rewards')
        .select('id, name, points_required')
        .eq('merchant_id', merchantId)
        .order('points_required', { ascending: true });
      if (error) {
        console.error("Error fetching rewards:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!merchantId,
  });

  // Ajout : on récupère points_earned ET points_spent pour les visites
  const { data: visits, isLoading: isLoadingVisits } = useQuery({
    queryKey: ['visits', user?.id, merchantId],
    queryFn: async () => {
      if (!user || !merchantId) return [];
      const { data, error } = await supabase
        .from('visits')
        .select('id, created_at, amount_spent, points_earned, points_spent')
        .eq('customer_id', user.id)
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching visits:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user && !!merchantId,
  });

  const { data: rewardRedemptions, isLoading: isLoadingRedemptions } = useQuery({
    queryKey: ['rewardRedemptions', user?.id, merchantId],
    queryFn: async () => {
      if (!user || !merchantId) return [];
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          id,
          redeemed_at,
          points_spent,
          reward_id,
          rewards (
            name
          )
        `)
        .eq('customer_id', user.id)
        .eq('merchant_id', merchantId)
        .order('redeemed_at', { ascending: false });
      if (error) {
        console.error("Error fetching reward redemptions:", error);
        throw error;
      }
      // On filtre les rewards supprimées pour éviter le "null"
      return (data || []).filter(r => r.rewards && r.rewards.name);
    },
    enabled: !!user && !!merchantId,
  });

  const isLoading = isLoadingAccount || isLoadingRewards || isLoadingVisits || isLoadingRedemptions;

  // Fusion visites et redemptions AVEC affichage des points gagnés ET dépensés
  const historique = (() => {
    if (!visits && !rewardRedemptions) return [];
    // Chaque visite liste les points gagnés ET dépensés (négatif si utilisé sur une reward via RecordVisitForm)
    const visitesMap = (visits || []).map(visit => {
      const pointsList: { value: number; label: string }[] = [];
      if (typeof visit.points_earned === "number" && visit.points_earned !== 0) {
        pointsList.push({ value: visit.points_earned, label: "gagnés" });
      }
      if (typeof visit.points_spent === "number" && visit.points_spent !== 0) {
        pointsList.push({ value: -Math.abs(visit.points_spent), label: "dépensés" });
      }
      return {
        type: "visit" as const,
        id: visit.id,
        date: visit.created_at,
        montant: typeof visit.amount_spent === "number" ? visit.amount_spent : null,
        rewardName: null as string | null,
        pointsList,
      };
    });
    const redemptionsMap = (rewardRedemptions || []).map(redemption => ({
      type: "redemption" as const,
      id: redemption.id,
      date: redemption.redeemed_at,
      montant: null as number | null,
      rewardName: redemption.rewards ? redemption.rewards.name : null,
      pointsList: [
        { value: -Math.abs(redemption.points_spent), label: "dépensés" }
      ],
    }));
    return [...visitesMap, ...redemptionsMap].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  })();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link to="/tableau-de-bord-client">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p>Chargement des informations du commerçant...</p>
      ) : !loyaltyAccount || !loyaltyAccount.merchants ? (
        <p>Impossible de trouver les informations pour ce commerçant.</p>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-6">{loyaltyAccount.merchants.name}</h1>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <CustomerRewardsList
                rewards={rewards || []}
                currentPoints={loyaltyAccount.loyalty_points}
              />
              <CustomerLoyaltyHistoryTable
                historique={historique}
                isLoading={isLoadingVisits || isLoadingRedemptions}
              />
            </div>
            <div className="lg:col-span-1">
              <CustomerLoyaltyInfoCard
                points={loyaltyAccount.loyalty_points}
                merchantInfo={{
                  address: loyaltyAccount.merchants.address,
                  phone: loyaltyAccount.merchants.phone,
                  contact_email: loyaltyAccount.merchants.contact_email,
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerMerchantDetails;
