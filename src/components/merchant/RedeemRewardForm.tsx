import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Database } from '@/integrations/supabase/types';

type Merchant = Database['public']['Tables']['merchants']['Row'];
type Reward = Database['public']['Tables']['rewards']['Row'];

const searchSchema = z.object({
  phone: z.string().min(1, 'Le numéro de téléphone est requis.'),
});

interface RedeemRewardFormProps {
  merchant: Merchant;
}

const RedeemRewardForm = ({ merchant }: RedeemRewardFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState<{ id: string; points: number; first_name: string; last_name: string } | null>(null);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<string>('');

  const searchForm = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { phone: '' },
  });

  async function handleSearch(values: z.infer<typeof searchSchema>) {
    setIsLoading(true);
    setCustomer(null);
    setAvailableRewards([]);
    setSelectedReward('');

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('phone', values.phone)
      .single();

    if (profileError || !profileData) {
      toast({ title: 'Erreur', description: 'Client non trouvé.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    const { data: linkData, error: linkError } = await supabase
      .from('customer_merchant_link')
      .select('loyalty_points')
      .eq('customer_id', profileData.id)
      .eq('merchant_id', merchant.id)
      .single();
    
    if (linkError || !linkData) {
      toast({ title: 'Information', description: 'Ce client n\'a pas encore de points chez vous.' });
      setCustomer({ id: profileData.id, points: 0, first_name: profileData.first_name, last_name: profileData.last_name });
      setIsLoading(false);
      return;
    }

    setCustomer({ id: profileData.id, points: linkData.loyalty_points, first_name: profileData.first_name, last_name: profileData.last_name });
    
    const { data: rewardsData, error: rewardsError } = await supabase
      .from('rewards')
      .select('*')
      .eq('merchant_id', merchant.id)
      .lte('points_required', linkData.loyalty_points)
      .order('points_required');

    if (rewardsError) {
      toast({ title: 'Erreur', description: 'Impossible de charger les récompenses.', variant: 'destructive' });
    } else {
      setAvailableRewards(rewardsData || []);
    }
    
    setIsLoading(false);
  }

  async function handleRedeem() {
    if (!selectedReward) return;
    setIsLoading(true);
    
    const { data, error } = await supabase.rpc('redeem_reward', {
      customer_phone_number: searchForm.getValues('phone'),
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
      searchForm.reset();
      setCustomer(null);
      setAvailableRewards([]);
      setSelectedReward('');
    }
  }

  return (
    <div className="space-y-6">
      <Form {...searchForm}>
        <form onSubmit={searchForm.handleSubmit(handleSearch)} className="flex items-end gap-2">
          <FormField
            control={searchForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>Numéro de téléphone du client</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 0612345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '...' : 'Chercher'}
          </Button>
        </form>
      </Form>

      {customer && (
        <div className="border-t pt-4">
          <h4 className="font-semibold">{customer.first_name} {customer.last_name}</h4>
          <p className="text-sm text-muted-foreground">Solde de points: {customer.points}</p>
          
          {availableRewards.length > 0 ? (
             <div className="mt-4 space-y-4">
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
            <p className="mt-4 text-sm text-muted-foreground">Ce client n'a pas assez de points pour une récompense.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RedeemRewardForm;
