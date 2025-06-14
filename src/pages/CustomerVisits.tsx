
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
  const { data: visits, isLoading: isLoadingVisits, error: errorVisits } = useQuery({
    queryKey: ['visits', merchantId, customerId],
    queryFn: async () => {
      if (!merchantId || !customerId) return [];
      const { data, error } = await supabase
        .from("visits")
        .select("id, created_at, points_earned, amount_spent, points_spent")
        .eq("merchant_id", merchantId)
        .eq("customer_id", customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!merchantId && !!customerId,
  });

  // Récupérer toutes les récompenses utilisées par ce client pour ce commerçant
  const { data: rewardRedemptions, isLoading: isLoadingRewards, error: errorRewards } = useQuery({
    queryKey: ['rewardRedemptions', merchantId, customerId],
    queryFn: async () => {
      if (!merchantId || !customerId) return [];
      // On récupère la récompense pour afficher son nom
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          id,
          redeemed_at,
          points_spent,
          reward_id,
          rewards (
            name
          )
        `)
        .eq('merchant_id', merchantId)
        .eq('customer_id', customerId)
        .order('redeemed_at', { ascending: false });
      if (error) throw error;
      // On filtre les rewards supprimées
      return (data || []).filter(r => r.rewards && r.rewards.name);
    },
    enabled: !!merchantId && !!customerId,
  });

  const isLoading = isLoadingVisits || isLoadingRewards;
  const error = errorVisits || errorRewards;

  // Refacto : chaque visite peut être une rédemption (points_spent > 0, amount_spent nul)
  const historique = React.useMemo(() => {
    const visitesMap = (visits || []).map(visit => {
      const pointsList: { value: number; label: string }[] = [];
      let mainType: "visit" | "redemption" = "visit";
      let rewardName: string | null = null;
      if (typeof visit.points_spent === "number" && visit.points_spent > 0) {
        mainType = "redemption";
        pointsList.push({ value: -Math.abs(visit.points_spent), label: "dépensés" });
      }
      if (typeof visit.points_earned === "number" && visit.points_earned > 0) {
        pointsList.push({ value: visit.points_earned, label: "gagnés" });
      }
      return {
        type: mainType,
        id: visit.id,
        date: visit.created_at,
        montant: typeof visit.amount_spent === "number" ? visit.amount_spent : null,
        rewardName,
        pointsList,
      };
    });
    const redemptionsMap = (rewardRedemptions || []).map(redemption => ({
      type: "redemption" as const,
      id: redemption.id,
      date: redemption.redeemed_at,
      montant: null as number | null,
      rewardName: redemption.rewards ? redemption.rewards.name : null,
      pointsList: [
        { value: -Math.abs(redemption.points_spent), label: "dépensés" }
      ],
    }));

    // Combine and sort all
    return [...visitesMap, ...redemptionsMap].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [visits, rewardRedemptions]);

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
          <h2 className="text-lg font-medium mb-2">Historique des visites et des récompenses</h2>
          {isLoading && <p>Chargement...</p>}
          {error && <p className="text-destructive">Erreur : {error.message}</p>}
          {(!historique || historique.length === 0) && (
            <p className="text-muted-foreground italic">Aucun historique trouvé pour ce client.</p>
          )}
          {historique && historique.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant dépensé / Récompense</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historique.map((entry) => (
                  <TableRow key={entry.type + "-" + entry.id}>
                    <TableCell>
                      {format(new Date(entry.date), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell>
                      {entry.type === "visit"
                        ? entry.montant !== null && entry.montant !== undefined && entry.montant !== 0
                          ? `${entry.montant} €`
                          : (entry.pointsList.find(pt => pt.label === "dépensés") ? "-- € Utilisé récompense" : "")
                        : `-- €${entry.rewardName ? ` (${entry.rewardName})` : ""}`}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.pointsList && entry.pointsList.length > 0 ? (
                        <div className="flex flex-col items-end gap-0.5">
                          {entry.pointsList.map((pt, i) => (
                            <span
                              key={pt.label + i}
                              className={pt.value > 0 ? "text-green-600" : "text-red-600"}
                            >
                              {pt.value > 0 ? `+${pt.value}` : pt.value}{" "}
                              <span className="text-xs text-muted-foreground normal-case">{pt.label}</span>
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </TableCell>
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
