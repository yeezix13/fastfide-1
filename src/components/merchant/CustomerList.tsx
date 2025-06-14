
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
  profiles: Profile | null;
}

const CustomerList = ({ merchant }: CustomerListProps) => {
  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['merchantCustomers', merchant.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_merchant_link')
        .select(`
          loyalty_points,
          profiles:customer_id (
            id,
            first_name,
            last_name,
            phone
          )
        `)
        .eq('merchant_id', merchant.id);

      if (error) throw error;
      return data as CustomerWithProfile[];
    },
  });

  if (isLoading) return <p>Chargement des clients...</p>;
  if (error) return <p className="text-destructive">Erreur: {error.message}</p>;
  if (!customers || customers.length === 0) {
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
            {customers.map(customer => {
              const profile = customer.profiles;
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

