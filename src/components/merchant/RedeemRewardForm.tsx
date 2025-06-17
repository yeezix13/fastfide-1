
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import CustomerFinder from './CustomerFinder';

// Fonctions pour masquer les informations
const obfuscatePhone = (phone: string | null): string => {
  if (!phone) return '-';
  if (phone.length <= 4) return phone;
  return `••••••${phone.slice(-4)}`;
};

const obfuscateEmail = (email: string | null): string => {
  if (!email || !email.includes('@')) return email ?? '-';
  const [local, domain] = email.split('@');
  const obfuscatePart = (part: string, visibleStart: number, visibleEnd: number) => {
    if (part.length <= visibleStart + visibleEnd) {
      return part;
    }
    return `${part.slice(0, visibleStart)}...${part.slice(-visibleEnd)}`;
  };
  return `${obfuscatePart(local, 2, 1)}@${obfuscatePart(domain, 2, 3)}`;
};

type Merchant = Database['public']['Tables']['merchants']['Row'];
type Reward = Database['public']['Tables']['rewards']['Row'];
type CustomerProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
};

const RedeemRewardForm = ({ merchant, themeColor }: { merchant: Merchant; themeColor?: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
    try {
      // 1. Trouver le lien de fidélité
      const { data: linkData, error: linkError } = await supabase
        .from('customer_merchant_link')
        .select('loyalty_points')
        .eq('customer_id', customer.id)
        .eq('merchant_id', merchant.id)
        .maybeSingle();

      if (linkError) throw linkError;

      let points = 0;
      if (linkData && linkData.loyalty_points != null) {
        points = linkData.loyalty_points;
      }
      setCustomerPoints(points);

      // 2. Charger les récompenses disponibles si le client a des points
      if (points > 0) {
        const { data: rewardsData, error: rewardsError } = await supabase
          .from('rewards')
          .select('*')
          .eq('merchant_id', merchant.id)
          .lte('points_required', points)
          .order('points_required');
        
        if (rewardsError) throw rewardsError;
        setAvailableRewards(rewardsData || []);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de charger les données du client.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Lors de la sélection d'un client, charger ses infos
  const handleSelectCustomer = (customer: CustomerProfile) => {
    setCurrentCustomer(customer);
    fetchCustomerRewards(customer);
  };

  // Gérer l'utilisation d'une récompense
  const handleRedeem = async () => {
    if (!selectedReward || !currentCustomer) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('redeem_reward', {
        customer_phone_number: currentCustomer.phone,
        merchant_user_id: merchant.user_id,
        reward_id_to_redeem: selectedReward,
      });

      if (error || (data as any)?.error) {
        throw new Error((data as any)?.error || error?.message || "Une erreur s'est produite.");
      }

      if ((data as any)?.success) {
        toast({
          title: 'Succès !',
          description: `La récompense "${(data as any).reward_name}" a été utilisée pour ${(data as any).customer.first_name} ${(data as any).customer.last_name}.`,
        });

        // Envoyer une notification email si le client a une adresse email
        if (currentCustomer.email) {
          try {
            await supabase.functions.invoke('send-notification', {
              body: {
                type: 'reward_redeemed',
                customerEmail: currentCustomer.email,
                customerName: `${currentCustomer.first_name} ${currentCustomer.last_name}`,
                merchantName: merchant.name,
                merchantColor: themeColor,
                rewardName: (data as any).reward_name,
                pointsSpent: (data as any).points_deducted,
              },
            });
            console.log('Notification email sent for reward redemption');
          } catch (emailError) {
            console.error('Error sending notification email:', emailError);
            // N'affiche pas d'erreur à l'utilisateur, l'email est optionnel
          }
        }

        // Invalider les queries pour rafraîchir les données
        queryClient.invalidateQueries({ queryKey: ['merchantCustomers'] });
        queryClient.invalidateQueries({ queryKey: ['loyaltyAccounts'] });
        queryClient.invalidateQueries({ queryKey: ['visits'] });
        queryClient.invalidateQueries({ queryKey: ['rewardRedemptions'] });

        // Rafraîchir les données du client actuel
        await fetchCustomerRewards(currentCustomer);
      }
    } catch (error: any) {
      console.error('Redemption error:', error);
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur s'est produite lors de l'utilisation de la récompense.",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        <div
          className="font-medium text-base"
          style={themeColor ? { color: themeColor } : undefined}
        >
          {currentCustomer.first_name} {currentCustomer.last_name}
        </div>
        <div className="text-xs text-muted-foreground">
          <span>Tél: {obfuscatePhone(currentCustomer.phone)}</span> &nbsp; | &nbsp;
          <span>Email: {obfuscateEmail(currentCustomer.email)}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          type="button"
          onClick={() => setCurrentCustomer(null)}
          style={themeColor ? { color: themeColor } : undefined}
        >
          Changer de client
        </Button>
        <div className="text-sm mt-2">
          Solde de points : <b style={themeColor ? { color: themeColor } : undefined}>{customerPoints ?? "..."}</b>
        </div>
      </div>
      
      {customerPoints === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Ce client n'a pas encore de points chez vous.</p>
      ) : (
        availableRewards.length > 0 ? (
          <div className="space-y-4">
            <Select onValueChange={setSelectedReward} value={selectedReward}>
              <SelectTrigger style={themeColor ? { borderColor: themeColor } : undefined}>
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
            <Button
              onClick={handleRedeem}
              disabled={isLoading || !selectedReward}
              className="w-full"
              style={themeColor ? { backgroundColor: themeColor, borderColor: themeColor } : undefined}
            >
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
