
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type Reward = { id: string; name: string; points_required: number; };
interface CustomerRewardsListProps {
  rewards: Reward[];
  currentPoints: number;
}

const CustomerRewardsList: React.FC<CustomerRewardsListProps> = ({ rewards, currentPoints }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">Vos Récompenses</CardTitle>
      <CardDescription>Utilisez vos points pour obtenir ces avantages.</CardDescription>
    </CardHeader>
    <CardContent>
      {rewards && rewards.length > 0 ? (
        <ul className="space-y-3">
          {rewards.map(reward => (
            <li
              key={reward.id}
              className={`flex justify-between items-center p-3 rounded-lg ${currentPoints >= reward.points_required ? "bg-green-100" : "bg-gray-100"}`}>
              <span>{reward.name}</span>
              <span className="font-bold">{reward.points_required} pts</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">Aucune récompense n'est configurée par ce commerçant pour le moment.</p>
      )}
    </CardContent>
  </Card>
);

export default CustomerRewardsList;
