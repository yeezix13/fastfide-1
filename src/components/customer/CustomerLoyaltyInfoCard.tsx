
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail } from "lucide-react";

interface MerchantInfo {
  address?: string | null;
  phone?: string | null;
  contact_email?: string | null;
}
interface Props {
  points: number;
  merchantInfo: MerchantInfo;
  themeColor?: string;
}

const CustomerLoyaltyInfoCard: React.FC<Props> = ({ points, merchantInfo, themeColor = "#2563eb" }) => (
  <Card>
    <CardHeader>
      <CardTitle>Mes Points & Infos</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div
        className="text-center p-4 rounded-lg"
        style={{
          background: `${themeColor}22`, // light background with 20% opacity (hex)
          border: `2px solid ${themeColor}`,
        }}
      >
        <p className="text-sm text-muted-foreground">Solde de points</p>
        <p className="text-4xl font-bold" style={{ color: themeColor }}>{points}</p>
      </div>
      <div className="space-y-2 text-sm">
        <h3 className="font-semibold flex items-center mb-2">Coordonnées</h3>
        <p className="flex items-start text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{merchantInfo.address}</span>
        </p>
        {merchantInfo.phone && (
          <p className="flex items-center text-muted-foreground">
            <Phone className="mr-2 h-4 w-4" /> <span>{merchantInfo.phone}</span>
          </p>
        )}
        {merchantInfo.contact_email && (
          <p className="flex items-center text-muted-foreground">
            <Mail className="mr-2 h-4 w-4" /> <span>{merchantInfo.contact_email}</span>
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default CustomerLoyaltyInfoCard;
