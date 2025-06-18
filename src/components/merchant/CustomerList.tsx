
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

type Merchant = Database['public']['Tables']['merchants']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface CustomerListProps {
  merchant: Merchant;
  themeColor?: string;
}

interface CustomerWithProfile {
  loyalty_points: number;
  profile: Profile | null;
  last_visit: string | null; // ISO string
  raw_link?: any;
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

const CustomerList = ({ merchant, themeColor }: CustomerListProps) => {
  const navigate = useNavigate();

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

      // Get all relevant profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', customerIds);

      if (profilesError) throw profilesError;

      // Pour chaque client, aller chercher la date de dernère visite (la plus récente)
      // On fait une seule requête pour tous les visits, puis on les trie côté client
      const { data: allVisits, error: visitsError } = await supabase
        .from('visits')
        .select('customer_id, created_at')
        .eq('merchant_id', merchant.id)
        .in('customer_id', customerIds);

      if (visitsError) throw visitsError;

      // Préparer un objet customerId => last_visit
      const lastVisits: Record<string, string> = {};
      (allVisits ?? []).forEach(v => {
        if (!lastVisits[v.customer_id] || new Date(v.created_at) > new Date(lastVisits[v.customer_id])) {
          lastVisits[v.customer_id] = v.created_at;
        }
      });

      const customersWithProfiles: CustomerWithProfile[] = links.map(link => ({
        loyalty_points: link.loyalty_points,
        profile: profiles?.find((p) => p.id === link.customer_id) ?? null,
        last_visit: lastVisits[link.customer_id] ?? null,
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
        <CardTitle style={themeColor ? { color: themeColor } : undefined}>Vos Clients Fidèles</CardTitle>
        <CardDescription>Liste de tous les clients ayant rejoint votre programme.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Code client</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Dernière visite</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.customers.map((customer, idx) => {
              const profile = customer.profile;
              const hasProfile = !!profile;
              return (
                <TableRow key={profile?.id ?? customer.raw_link?.customer_id ?? idx}>
                  <TableCell>
                    {hasProfile ? (
                      <button
                        className="text-primary underline hover:opacity-80 transition"
                        onClick={() =>
                          navigate(`/tableau-de-bord-commercant/visites-client/${merchant.id}/${profile.id}`)
                        }
                        style={themeColor ? { color: themeColor } : undefined}
                      >
                        {`${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || <span className="text-destructive italic">Profil manquant</span>}
                      </button>
                    ) : (
                      <span className="text-destructive italic">Profil manquant</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {profile?.client_code || <span className="text-muted-foreground italic">Non généré</span>}
                  </TableCell>
                  <TableCell>
                    {profile?.email 
                      ? obfuscateEmail(profile.email)
                      : <span className="text-destructive italic">-</span>
                    }
                  </TableCell>
                  <TableCell>
                    {profile?.phone ? obfuscatePhone(profile.phone) : <span className="text-destructive italic">-</span>}
                  </TableCell>
                  <TableCell className="text-right font-medium">{customer.loyalty_points}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {customer.last_visit
                      ? format(new Date(customer.last_visit), 'yyyy-MM-dd HH:mm')
                      : <span className="text-muted-foreground italic">Jamais</span>
                    }
                  </TableCell>
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
