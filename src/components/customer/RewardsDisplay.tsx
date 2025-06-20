
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";

interface Reward {
  id: string;
  name: string;
  points_required: number;
}

interface RewardsDisplayProps {
  rewards: Reward[];
  currentPoints: number;
  themeColor?: string;
}

const RewardsDisplay: React.FC<RewardsDisplayProps> = ({ 
  rewards, 
  currentPoints, 
  themeColor = "#2563eb" 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" style={{ color: themeColor }} />
          Récompenses disponibles
        </CardTitle>
        <CardDescription>
          Échangez vos points contre ces récompenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rewards && rewards.length > 0 ? (
          <div className="space-y-3">
            {rewards.map(reward => {
              const canRedeem = currentPoints >= reward.points_required;
              return (
                <div
                  key={reward.id}
                  className={`flex justify-between items-center p-3 rounded-lg border ${
                    canRedeem 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{reward.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {reward.points_required} points requis
                    </p>
                  </div>
                  <Badge 
                    variant={canRedeem ? "default" : "secondary"}
                    style={canRedeem ? { backgroundColor: themeColor } : undefined}
                  >
                    {canRedeem ? "Disponible" : "Indisponible"}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Aucune récompense n'est configurée pour le moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RewardsDisplay;
