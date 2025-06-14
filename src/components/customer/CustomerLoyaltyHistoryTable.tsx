
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type HistoryEntry = {
  type: "visit" | "redemption";
  id: string;
  date: string;
  montant: number | null;
  rewardName: string | null;
  points: number;
};

interface Props {
  historique: HistoryEntry[];
  isLoading: boolean;
}

const CustomerLoyaltyHistoryTable: React.FC<Props> = ({ historique, isLoading }) => (
  <div>
    <div className="font-bold text-lg mb-2 flex items-center">Historique des Visites et Récompenses</div>
    <div className="text-muted-foreground mb-4">Vos passages et les récompenses utilisées, regroupés.</div>
    {isLoading ? (
      <div className="text-sm text-gray-500">Chargement de l’historique…</div>
    ) : historique.length > 0 ? (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Montant dépensé / Récompense</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {historique.map(entry => (
            <TableRow key={entry.type + "-" + entry.id}>
              <TableCell>{new Date(entry.date).toLocaleDateString("fr-FR")}</TableCell>
              <TableCell>
                {entry.type === "visit"
                  ? entry.montant !== null ? `${entry.montant} €` : ""
                  : `-- €${entry.rewardName ? ` (${entry.rewardName})` : ""}`}
              </TableCell>
              <TableCell
                className={`text-right font-medium ${entry.points > 0 ? "text-green-600" : "text-red-600"}`}>
                {entry.points > 0 ? `+${entry.points}` : entry.points}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : (
      <p className="text-muted-foreground">Aucun historique trouvé chez ce commerçant.</p>
    )}
  </div>
);

export default CustomerLoyaltyHistoryTable;
