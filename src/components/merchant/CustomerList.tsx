
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
  // debug info
  raw_link?: any;
}

const CustomerList = ({ merchant }: CustomerListProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['merchantCustomers', merchant.id],
    queryFn: async (): Promise<CustomerWithProfile[]> => {
      // 1. Récupérer tous les liens client <-> marchand pour ce marchand
      const { data: links, error: linkError } = await supabase
        .from('customer_merchant_link')
        .select('customer_id, loyalty_points')
        .eq('merchant_id', merchant.id);

      console.log('customer_merchant_link results:', links, 'error:', linkError);

      if (linkError) throw linkError;
      if (!links || links.length === 0) {
        console.log('No links found for this merchant');
        return [];
      }
      // 2. Extraire la liste des IDs client
      const customerIds = links.map(link => link.customer_id).filter(Boolean);

      console.log('customerIds:', customerIds);

      // Affichage debug
      if (!customerIds || customerIds.length === 0) {
        console.log('No customer IDs to fetch profiles for');
        return [];
      }

      // Affichons la vraie requête SQL brute (conversion UUID <-> string si besoin)
      const { data: rawProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', customerIds);

      console.log('profiles results:', rawProfiles, 'error:', profilesError);

      if (profilesError) throw profilesError;

      // On mappe les liens à leur profil (ou null s'il n'existe pas)
      const customersWithProfiles: CustomerWithProfile[] = links.map(link => ({
        loyalty_points: link.loyalty_points,
        profile: rawProfiles?.find((p) => p.id === link.customer_id) ?? null,
        raw_link: link, // debug
      }));

      console.log('customersWithProfiles for UI:', customersWithProfiles);

      return customersWithProfiles;
    },
  });

  if (isLoading) return <p>Chargement des clients...</p>;
  if (error) return <p className="text-destructive">Erreur: {error.message}</p>;
  if (!data || data.length === 0) {
    // Ajout debug : listons les liens / customerIds si jamais !
    return (
      <div>
        <p className="text-muted-foreground">Aucun client n'a encore rejoint votre programme de fidélité.</p>
        <pre className="text-xs bg-muted border rounded p-2 mt-2">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
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
              return (
                <TableRow key={profile?.id ?? customer.raw_link?.customer_id ?? idx}>
                  <TableCell>
                    {profile
                      ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`
                      : <span className="text-destructive italic">Profil manquant</span>}
                  </TableCell>
                  <TableCell>{profile?.phone ?? <span className="text-destructive italic">-</span>}</TableCell>
                  <TableCell className="text-right font-medium">{customer.loyalty_points}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <pre className="text-xs bg-muted border rounded p-2 mt-2">
          {/* Affichons toutes les datas pour debug */}
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
};

export default CustomerList;
