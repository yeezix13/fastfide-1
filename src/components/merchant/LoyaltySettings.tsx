
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Trash2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Merchant = Database['public']['Tables']['merchants']['Row'];

const pointsRuleSchema = z.object({
  points_per_euro: z.coerce.number().min(0, "La valeur doit être positive."),
});

const newRewardSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  points_required: z.coerce.number().min(1, 'Le seuil doit être d\'au moins 1 point.'),
});

interface LoyaltySettingsProps {
  merchant: Merchant;
}

const LoyaltySettings = ({ merchant }: LoyaltySettingsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rewards, isLoading: isLoadingRewards } = useQuery({
    queryKey: ['rewards', merchant.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('merchant_id', merchant.id)
        .order('points_required');
      if (error) throw error;
      return data;
    },
  });

  const updatePointsRuleMutation = useMutation({
    mutationFn: async (newRate: number) => {
      const { error } = await supabase
        .from('merchants')
        .update({ points_per_euro: newRate })
        .eq('id', merchant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Succès', description: 'Règle de points mise à jour.' });
      queryClient.invalidateQueries({ queryKey: ['merchantDetails', merchant.user_id] });
    },
    onError: () => toast({ title: 'Erreur', description: 'Impossible de mettre à jour la règle.', variant: 'destructive' }),
  });

  const addRewardMutation = useMutation({
    mutationFn: async (newReward: z.infer<typeof newRewardSchema>) => {
      const { error } = await supabase.from('rewards').insert({ ...newReward, merchant_id: merchant.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Succès', description: 'Récompense ajoutée.' });
      queryClient.invalidateQueries({ queryKey: ['rewards', merchant.id] });
      rewardForm.reset();
    },
    onError: (err) => toast({ title: 'Erreur', description: err.message || 'Impossible d\'ajouter la récompense.', variant: 'destructive' }),
  });
  
  const deleteRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
        const { error } = await supabase.from('rewards').delete().eq('id', rewardId);
        if (error) throw error;
    },
    onSuccess: () => {
        toast({ title: 'Succès', description: 'Récompense supprimée.' });
        queryClient.invalidateQueries({ queryKey: ['rewards', merchant.id] });
    },
    onError: () => toast({ title: 'Erreur', description: 'Impossible de supprimer la récompense.', variant: 'destructive' }),
  });

  const pointsRuleForm = useForm<z.infer<typeof pointsRuleSchema>>({
    resolver: zodResolver(pointsRuleSchema),
    defaultValues: { points_per_euro: merchant.points_per_euro || 1 },
  });
  
  const rewardForm = useForm<z.infer<typeof newRewardSchema>>({
    resolver: zodResolver(newRewardSchema),
    defaultValues: { name: '', points_required: undefined },
  });
  
  return (
    <div className="space-y-8">
      <Form {...pointsRuleForm}>
        <form onSubmit={pointsRuleForm.handleSubmit(values => updatePointsRuleMutation.mutate(values.points_per_euro))} className="space-y-4">
          <FormField
            control={pointsRuleForm.control}
            name="points_per_euro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points gagnés par Euro dépensé</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={updatePointsRuleMutation.isPending}>
            {updatePointsRuleMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder la règle'}
          </Button>
        </form>
      </Form>
      
      <hr />

      <div>
        <h4 className="text-lg font-semibold mb-4">Vos récompenses</h4>
        {isLoadingRewards ? <p>Chargement...</p> : (
          <ul className="space-y-2 mb-6">
            {rewards?.map(reward => (
              <li key={reward.id} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                <span>{reward.name} ({reward.points_required} pts)</span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteRewardMutation.mutate(reward.id)}
                    disabled={deleteRewardMutation.isPending && deleteRewardMutation.variables === reward.id}
                    aria-label="Supprimer la récompense"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
             {rewards?.length === 0 && <p className="text-sm text-muted-foreground">Aucune récompense configurée.</p>}
          </ul>
        )}
        
        <Form {...rewardForm}>
          <form onSubmit={rewardForm.handleSubmit(values => addRewardMutation.mutate(values))} className="space-y-4 border-t pt-6">
             <h5 className="font-semibold">Ajouter une récompense</h5>
             <FormField
                control={rewardForm.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Café offert" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={rewardForm.control}
                name="points_required"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Points requis</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Ex: 100" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <Button type="submit" disabled={addRewardMutation.isPending}>
              {addRewardMutation.isPending ? 'Ajout...' : 'Ajouter la récompense'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default LoyaltySettings;
