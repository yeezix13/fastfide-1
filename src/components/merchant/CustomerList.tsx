
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Merchant = Database['public']['Tables']['merchants']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface CustomerListProps {
  merchant: Merchant;
}

interface CustomerWithProfile {
  loyalty_points: number;
  profile: Profile | null;
}

const CustomerList = ({ merchant }: CustomerListProps) => {
  // On utilise une seule query "customers" qui fait deux fetchs
  const { data, isLoading, error } = useQuery({
    queryKey: ['merchantCustomers', merchant.id],
    queryFn: async (): Promise<CustomerWithProfile[]> => {
      // 1. Récupérer tous les liens client <-> marchand pour ce marchand
      const { data: links, error: linkError } = await supabase
        .from('customer_merchant_link')
        .select('customer_id, loyalty_points')
        .eq('merchant_id', merchant.id);
      if (linkError) throw linkError;
      if (!links || links.length === 0) return [];
      // 2. Extraire la liste des IDs client
      const customerIds = links.map(link => link.customer_id).filter(Boolean);
      // 3. Charger tous les profils pour ces IDs (batch)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', customerIds);
      if (profilesError) throw profilesError;
      // 4. Associer les profils aux liens
      return links.map(link => ({
        loyalty_points: link.loyalty_points,
        profile: profiles?.find(p => p.id === link.customer_id) ?? null
      }));
    },
  });

  if (isLoading) return <p>Chargement des clients...</p>;
  if (error) return <p className="text-destructive">Erreur: {error.message}</p>;
  if (!data || data.length === 0) {
    return <p className="text-muted-foreground">Aucun client n'a encore rejoint votre programme de fidélité.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vos Clients Fidèles</CardTitle>
        <CardDescription>Liste de tous les clients ayant rejoint votre programme.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((customer, idx) => {
              const profile = customer.profile;
              if (!profile) return null;
              return (
                <TableRow key={profile.id}>
                  <TableCell>{profile.first_name ?? ''} {profile.last_name ?? ''}</TableCell>
                  <TableCell>{profile.phone ?? ''}</TableCell>
                  <TableCell className="text-right font-medium">{customer.loyalty_points}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CustomerList;
