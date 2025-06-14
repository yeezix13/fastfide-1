
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

type Merchant = Database['public']['Tables']['merchants']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface CustomerListProps {
  merchant: Merchant;
}

interface CustomerWithProfile {
  loyalty_points: number;
  profile: Profile | null;
  raw_link?: any;
}

const CustomerList = ({ merchant }: CustomerListProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['merchantCustomers', merchant.id],
    queryFn: async (): Promise<{ customers: CustomerWithProfile[] }> => {
      const { data: links, error: linkError } = await supabase
        .from('customer_merchant_link')
        .select('customer_id, loyalty_points')
        .eq('merchant_id', merchant.id);

      if (linkError) throw linkError;
      if (!links || links.length === 0) {
        return { customers: [] };
      }
      const customerIds = links.map(link => link.customer_id).filter(Boolean);

      if (!customerIds || customerIds.length === 0) {
        return { customers: [] };
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', customerIds);

      if (profilesError) throw profilesError;

      const customersWithProfiles: CustomerWithProfile[] = links.map(link => ({
        loyalty_points: link.loyalty_points,
        profile: profiles?.find((p) => p.id === link.customer_id) ?? null,
        raw_link: link,
      }));

      return { customers: customersWithProfiles };
    },
  });

  if (isLoading) return <p>Chargement des clients...</p>;
  if (error) return <p className="text-destructive">Erreur: {error.message}</p>;
  if (!data || data.customers.length === 0) {
    return (
      <div>
        <p className="text-muted-foreground">Aucun client n'a encore rejoint votre programme de fidélité.</p>
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
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead className="text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.customers.map((customer, idx) => {
              const profile = customer.profile;
              return (
                <TableRow key={profile?.id ?? customer.raw_link?.customer_id ?? idx}>
                  <TableCell>
                    {profile
                      ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`
                      : <span className="text-destructive italic">Profil manquant</span>}
                  </TableCell>
                  <TableCell>
                    {profile?.email
                      ? profile.email
                      : <span className="text-destructive italic">-</span>
                    }
                  </TableCell>
                  <TableCell>
                    {profile?.phone ?? <span className="text-destructive italic">-</span>}
                  </TableCell>
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

