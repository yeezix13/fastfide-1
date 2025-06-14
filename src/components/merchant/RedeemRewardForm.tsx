
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/components/ui/use-toast';
import CustomerFinder from './CustomerFinder';

type Merchant = Database['public']['Tables']['merchants']['Row'];
type Reward = Database['public']['Tables']['rewards']['Row'];
type CustomerProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
};

const RedeemRewardForm = ({ merchant }: { merchant: Merchant }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(null);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<string>('');
  const [customerPoints, setCustomerPoints] = useState<number | null>(null);

  // Recherche les points et récompenses quand currentCustomer change
  const fetchCustomerRewards = async (customer: CustomerProfile) => {
    setCustomerPoints(null);
    setAvailableRewards([]);
    setSelectedReward('');

    setIsLoading(true);
    // 1. Trouver le lien de fidélité
    const { data: linkData, error: linkError } = await supabase
      .from('customer_merchant_link')
      .select('loyalty_points')
      .eq('customer_id', customer.id)
      .eq('merchant_id', merchant.id)
      .maybeSingle();

    let points = 0;
    if (linkData && linkData.loyalty_points != null) {
      points = linkData.loyalty_points;
      setCustomerPoints(points);
    } else {
      setCustomerPoints(0);
    }

    // 2. Charger les récompenses disponibles
    if (points > 0) {
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('*')
        .eq('merchant_id', merchant.id)
        .lte('points_required', points)
        .order('points_required');
      if (rewardsError) {
        toast({ title: 'Erreur', description: 'Impossible de charger les récompenses.', variant: 'destructive' });
      } else {
        setAvailableRewards(rewardsData || []);
      }
    }
    setIsLoading(false);
  };

  // Lors de la sélection d'un client, charger ses infos
  const handleSelectCustomer = (customer: CustomerProfile) => {
    setCurrentCustomer(customer);
    fetchCustomerRewards(customer);
  };

  // Gérer l'utilisation d'une récompense
  async function handleRedeem() {
    if (!selectedReward || !currentCustomer) return;
    setIsLoading(true);

    const { data, error } = await supabase.rpc('redeem_reward', {
      customer_phone_number: currentCustomer.phone,
      merchant_user_id: merchant.user_id,
      reward_id_to_redeem: selectedReward,
    });

    setIsLoading(false);
    if (error || (data as any)?.error) {
       toast({
        title: 'Erreur',
        description: (data as any)?.error || error?.message || "Une erreur s'est produite.",
        variant: 'destructive',
      });
    } else if ((data as any)?.success) {
      toast({
        title: 'Succès !',
        description: `La récompense a été utilisée pour ${(data as any).customer.first_name} ${(data as any).customer.last_name}.`,
      });
      setCurrentCustomer(null);
      setAvailableRewards([]);
      setSelectedReward('');
      setCustomerPoints(null);
    }
  }

  // 1. ETAPE DE RECHERCHE CLIENT
  if (!currentCustomer) {
    return (
      <div>
        <p className="mb-2 text-sm">Recherchez le client par <b>téléphone, nom ou prénom</b> :</p>
        <CustomerFinder onSelect={handleSelectCustomer} />
      </div>
    );
  }

  // 2. ETAPE AFFICHAGE CLIENT & RECOMPENSES
  return (
    <div>
      <div className="border rounded p-3 mb-4 bg-muted/50">
        <div className="font-medium text-base">
          {currentCustomer.first_name} {currentCustomer.last_name}
        </div>
        <div className="text-xs text-muted-foreground">
          <span>Tél: {currentCustomer.phone || "-"}</span> &nbsp; | &nbsp;
          <span>Email: {currentCustomer.email || "-"}</span>
        </div>
        <Button variant="ghost" size="sm" className="mt-2" type="button" onClick={() => setCurrentCustomer(null)}>
          Changer de client
        </Button>
        <div className="text-sm mt-2">Solde de points : <b>{customerPoints ?? "..."}</b></div>
      </div>
      {customerPoints === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Ce client n'a pas encore de points chez vous.</p>
      ) : (
        availableRewards.length > 0 ? (
          <div className="space-y-4">
            <Select onValueChange={setSelectedReward} value={selectedReward}>
              <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une récompense" />
              </SelectTrigger>
              <SelectContent>
                  {availableRewards.map(reward => (
                      <SelectItem key={reward.id} value={reward.id}>
                          {reward.name} ({reward.points_required} pts)
                      </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button onClick={handleRedeem} disabled={isLoading || !selectedReward} className="w-full">
                {isLoading ? 'Utilisation...' : 'Utiliser la récompense'}
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Aucune récompense disponible pour ce client.</p>
        )
      )}
    </div>
  );
};

export default RedeemRewardForm;

