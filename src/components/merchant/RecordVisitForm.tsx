
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Merchant = Database['public']['Tables']['merchants']['Row'];

const formSchema = z.object({
  phone: z.string().min(1, 'Le numéro de téléphone est requis.'),
  amount: z.coerce.number().min(0.01, 'Le montant doit être supérieur à 0.'),
});

interface RecordVisitFormProps {
  merchant: Merchant;
}

const RecordVisitForm = ({ merchant }: RecordVisitFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: '',
      amount: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { data, error } = await supabase.rpc('record_visit', {
      customer_phone_number: values.phone,
      merchant_user_id: merchant.user_id,
      spent_amount: values.amount,
    });
    
    setIsLoading(false);

    if (error || data.error) {
      toast({
        title: 'Erreur',
        description: data?.error || error?.message || "Une erreur s'est produite.",
        variant: 'destructive',
      });
    } else if (data.success) {
      toast({
        title: 'Succès !',
        description: `${data.points_earned} points ont été ajoutés pour ${data.customer.first_name} ${data.customer.last_name}.`,
      });
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro de téléphone du client</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 0612345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant dépensé (€)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="Ex: 25.50" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Enregistrement...' : 'Enregistrer la visite'}
        </Button>
      </form>
    </Form>
  );
};

export default RecordVisitForm;
