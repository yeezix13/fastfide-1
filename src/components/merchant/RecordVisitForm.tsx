
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
import CustomerFinder from './CustomerFinder';

type Merchant = Database['public']['Tables']['merchants']['Row'];

const formSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Le montant doit être supérieur à 0.'),
});

interface RecordVisitFormProps {
  merchant: Merchant;
  themeColor?: string;
}

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


const RecordVisitForm = ({ merchant, themeColor }: RecordVisitFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    email: string | null;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
    },
  });

  // Nouvelle étape : recherche et sélection du client
  if (!currentCustomer) {
    return (
      <div>
        <p className="mb-2 text-sm">Recherchez le client par <b>nom ou numéro de téléphone</b> :</p>
        <CustomerFinder onSelect={(customer) => setCurrentCustomer(customer)} />
      </div>
    );
  }

  // Affichage infos client + saisie montant
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // On utilise le numéro de téléphone du client sélectionné
    const { data, error } = await supabase.rpc('record_visit', {
      customer_phone_number: currentCustomer.phone,
      merchant_user_id: merchant.user_id,
      spent_amount: values.amount,
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
        description: `${(data as any).points_earned} points ajoutés pour ${currentCustomer.first_name} ${currentCustomer.last_name}.`,
      });
      setCurrentCustomer(null);
      form.reset();
    }
  }

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
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel style={themeColor ? { color: themeColor } : undefined}>Montant dépensé (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ex: 25.50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            style={themeColor ? { backgroundColor: themeColor, borderColor: themeColor } : undefined}
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer la visite'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RecordVisitForm;
