import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Merchant = Database['public']['Tables']['merchants']['Row'];

interface CustomerListProps {
  merchant: Merchant;
}

const CustomerList = ({ merchant }: CustomerListProps) => {
  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['merchantCustomers', merchant.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_merchant_link')
        .select(`
          loyalty_points,
          profiles (
            id,
            first_name,
            last_name,
            phone
          )
        `)
        .eq('merchant_id', merchant.id);

      if (error) throw error;
      return data;
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
              // The type of 'profiles' is currently inferred incorrectly, causing a build error.
              // We cast it to 'any' as a temporary measure to unblock the UI and diagnose the issue.
              const profile = customer.profiles as any;
              
              if (!profile) return null;

              // If the query fails at runtime, 'profile' might be an error object.
              if (profile.error) {
                console.error("Error fetching profile for a customer:", profile.error);
                return null;
              }

              return (
                <TableRow key={profile.id}>
                  <TableCell>{profile.first_name} {profile.last_name}</TableCell>
                  <TableCell>{profile.phone}</TableCell>
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
