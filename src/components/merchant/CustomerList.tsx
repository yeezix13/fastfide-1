
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
  const { data, isLoading, error } = useQuery({
    queryKey: ['merchantCustomers', merchant.id],
    queryFn: async () => {
      // ATTENTION: il faut bien faire la jointure sur customer_id avec l'alias profiles:customer_id !
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

      // On vérifie qu'on a bien un tableau dont chaque élément a .profiles en objet ou null
      // Si la jointure échoue, .profiles sera potentiellement une string avec un champ error. On filtre uniquement les bons résultats.
      return (data as unknown as CustomerWithProfile[]).filter(
        c => c.profiles && typeof c.profiles === "object" && "id" in c.profiles
      );
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
            {data.map(customer => {
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
