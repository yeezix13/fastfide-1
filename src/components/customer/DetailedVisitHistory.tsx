
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, TrendingUp, Gift } from "lucide-react";
import { useVisitHistory } from "@/hooks/useVisitHistory";
import { useRewardRedemptions } from "@/hooks/useRewardRedemptions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DetailedVisitHistoryProps {
  customerId: string | null;
}

const DetailedVisitHistory = ({ customerId }: DetailedVisitHistoryProps) => {
  const { data: visits, isLoading: visitsLoading } = useVisitHistory(customerId);
  const { data: redemptions, isLoading: redemptionsLoading } = useRewardRedemptions(customerId);

  if (visitsLoading || redemptionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique Détaillé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Combiner et trier les visites et rachats par date
  const allActivities = [
    ...(visits || []).map(visit => ({
      type: 'visit' as const,
      date: new Date(visit.created_at),
      data: visit
    })),
    ...(redemptions || []).map(redemption => ({
      type: 'redemption' as const,
      date: new Date(redemption.redeemed_at),
      data: redemption
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historique Détaillé
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allActivities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Aucune activité enregistrée pour le moment.
          </p>
        ) : (
          <div className="space-y-3">
            {allActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {activity.type === 'visit' ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <Gift className="h-5 w-5 text-orange-600" />
                  )}
                  <div>
                    <div className="font-medium">
                      {activity.type === 'visit' 
                        ? activity.data.merchants?.name 
                        : activity.data.merchants?.name
                      }
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(activity.date, 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </div>
                    {activity.type === 'visit' && (
                      <div className="text-sm text-gray-600">
                        Achat: {activity.data.amount_spent}€
                        {activity.data.points_spent > 0 && (
                          <span className="text-orange-600 ml-2">
                            • {activity.data.points_spent} points utilisés
                          </span>
                        )}
                      </div>
                    )}
                    {activity.type === 'redemption' && (
                      <div className="text-sm text-gray-600">
                        Récompense: {activity.data.rewards?.name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {activity.type === 'visit' ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +{activity.data.points_earned} pts
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      -{activity.data.points_spent} pts
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailedVisitHistory;
