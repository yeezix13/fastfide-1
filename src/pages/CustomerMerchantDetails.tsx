import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Award, Clock, Phone, Mail, Gift } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

  const { data: visits, isLoading: isLoadingVisits } = useQuery({
    queryKey: ['visits', user?.id, merchantId],
    queryFn: async () => {
      if (!user || !merchantId) return [];
      const { data, error } = await supabase
        .from('visits')
        .select('id, created_at, amount_spent, points_earned')
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

  // Fusionner visites et rewards dans un seul tableau trié par date
  const historique = (() => {
    if (!visits && !rewardRedemptions) return [];
    const visitesMap = (visits || []).map(visit => ({
      type: 'visit',
      id: visit.id,
      date: visit.created_at,
      montant: visit.amount_spent,
      rewardName: null,
      points: visit.points_earned,
    }));
    const redemptionsMap = (rewardRedemptions || []).map(redemption => ({
      type: 'redemption',
      id: redemption.id,
      date: redemption.redeemed_at,
      montant: null,
      rewardName: redemption.rewards ? redemption.rewards.name : null,
      points: -Math.abs(redemption.points_spent),
    }));
    // Fusionner et trier par date décroissante
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Award className="mr-2 h-5 w-5" /> Vos Récompenses</CardTitle>
                  <CardDescription>Utilisez vos points pour obtenir ces avantages.</CardDescription>
                </CardHeader>
                <CardContent>
                  {rewards && rewards.length > 0 ? (
                    <ul className="space-y-3">
                      {rewards.map(reward => (
                        <li key={reward.id} className={`flex justify-between items-center p-3 rounded-lg ${loyaltyAccount.loyalty_points >= reward.points_required ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <span>{reward.name}</span>
                          <span className="font-bold">{reward.points_required} pts</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Aucune récompense n'est configurée par ce commerçant pour le moment.</p>
                  )}
                </CardContent>
              </Card>

              {/* Unique tableau : visites + récompenses utilisées */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><Clock className="mr-2 h-5 w-5" /> Historique des Visites et Récompenses</CardTitle>
                  <CardDescription>Vos passages et les récompenses utilisées, regroupés.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingVisits || isLoadingRedemptions ? (
                    <div className="text-sm text-gray-500">Chargement de l’historique…</div>
                  ) : historique.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Montant dépensé / Récompense</TableHead>
                          <TableHead className="text-right">Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historique.map(entry => (
                          <TableRow key={entry.type + '-' + entry.id}>
                            <TableCell>{new Date(entry.date).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell>
                              {entry.type === 'visit'
                                ? (entry.montant !== null ? `${entry.montant} €` : '')
                                : (`-- €${entry.rewardName ? ` (${entry.rewardName})` : ''}`)}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${entry.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {entry.points > 0 ? `+${entry.points}` : entry.points}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground">Aucun historique trouvé chez ce commerçant.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Mes Points & Infos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center bg-primary/10 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Solde de points</p>
                    <p className="text-4xl font-bold">{loyaltyAccount.loyalty_points}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <h3 className="font-semibold flex items-center mb-2">Coordonnées</h3>
                    <p className="flex items-start text-muted-foreground"><MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" /> <span>{loyaltyAccount.merchants.address}</span></p>
                    {loyaltyAccount.merchants.phone && (
                        <p className="flex items-center text-muted-foreground"><Phone className="mr-2 h-4 w-4" /> <span>{loyaltyAccount.merchants.phone}</span></p>
                    )}
                    {loyaltyAccount.merchants.contact_email && (
                         <p className="flex items-center text-muted-foreground"><Mail className="mr-2 h-4 w-4" /> <span>{loyaltyAccount.merchants.contact_email}</span></p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerMerchantDetails;
