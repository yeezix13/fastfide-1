
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import CustomerFinder from './CustomerFinder';

type Merchant = Database['public']['Tables']['merchants']['Row'];
type CustomerProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
};

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

const RecordVisitForm = ({ merchant, themeColor }: { merchant: Merchant; themeColor?: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(null);

  const handleSelectCustomer = (customer: CustomerProfile) => {
    setCurrentCustomer(customer);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCustomer) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un client.',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir un montant valide.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('record_visit', {
        customer_phone_number: currentCustomer.phone,
        merchant_user_id: merchant.user_id,
        spent_amount: parseFloat(amount),
      });

      if (error || (data as any)?.error) {
        throw new Error((data as any)?.error || error?.message || "Une erreur s'est produite.");
      }

      if ((data as any)?.success) {
        toast({
          title: 'Visite enregistrée !',
          description: `${(data as any).points_earned} points ont été attribués à ${(data as any).customer.first_name} ${(data as any).customer.last_name}.`,
        });

        // Invalider les queries pour rafraîchir les données
        queryClient.invalidateQueries({ queryKey: ['merchantCustomers'] });
        queryClient.invalidateQueries({ queryKey: ['loyaltyAccounts'] });
        queryClient.invalidateQueries({ queryKey: ['visits'] });

        // Reset form
        setAmount('');
        setCurrentCustomer(null);
      }
    } catch (error: any) {
      console.error('Visit recording error:', error);
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur s'est produite lors de l'enregistrement de la visite.",
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

  // 2. ETAPE SAISIE MONTANT
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Montant dépensé (€)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={themeColor ? { borderColor: themeColor } : undefined}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !amount}
          className="w-full"
          style={themeColor ? { backgroundColor: themeColor, borderColor: themeColor } : undefined}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer la visite'}
        </Button>
      </form>
    </div>
  );
};

export default RecordVisitForm;
