
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import React from "react";
import { format } from 'date-fns';

const CustomerVisits = () => {
  const { merchantId, customerId } = useParams<{ merchantId: string; customerId: string }>();

  // Récupérer le profil du client
  const { data: profile } = useQuery({
    queryKey: ['profile', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", customerId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!customerId,
  });

  // Récupérer toutes les visites de ce client pour ce commerçant
  const { data: visits, isLoading, error } = useQuery({
    queryKey: ['visits', merchantId, customerId],
    queryFn: async () => {
      if (!merchantId || !customerId) return [];
      const { data, error } = await supabase
        .from("visits")
        .select("id, created_at, points_earned, amount_spent")
        .eq("merchant_id", merchantId)
        .eq("customer_id", customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!merchantId && !!customerId,
  });

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>
            <Link
              className="text-sm text-muted-foreground underline mr-2"
              to="/tableau-de-bord-commercant?tab=clients"
            >
              &larr; Retour
            </Link>
            {profile
              ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || "Client"
              : "Client"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-lg font-medium mb-2">Historique des visites</h2>
          {isLoading && <p>Chargement...</p>}
          {error && <p className="text-destructive">Erreur : {error.message}</p>}
          {(!visits || visits.length === 0) && (
            <p className="text-muted-foreground italic">Aucune visite enregistrée pour ce client.</p>
          )}
          {visits && visits.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date de visite</TableHead>
                  <TableHead className="text-right">Montant (€)</TableHead>
                  <TableHead className="text-right">Points gagnés</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map(visit => (
                  <TableRow key={visit.id}>
                    <TableCell>
                      {format(new Date(visit.created_at), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">{visit.amount_spent.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{visit.points_earned}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerVisits;
