
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Store, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDeviceType } from '@/hooks/useDeviceType';

interface LoyaltyAccount {
  loyalty_points: number;
  merchants: {
    id: string;
    name: string;
    theme_color: string;
  } | null;
}

interface LoyaltyCardsListProps {
  loyaltyAccounts: LoyaltyAccount[];
  isLoading: boolean;
}

const LoyaltyCardsList = ({ loyaltyAccounts, isLoading }: LoyaltyCardsListProps) => {
  const { isMobile } = useDeviceType();

  if (isLoading) {
    return <p className={isMobile ? 'text-center' : ''}>Chargement de vos cartes...</p>;
  }

  if (!loyaltyAccounts || loyaltyAccounts.length === 0) {
    return (
      <div className={`my-8 p-8 border-dashed border-2 rounded-lg text-center text-muted-foreground ${isMobile ? 'mx-4' : ''}`}>
        <p>Vous n'avez encore aucune carte de fidélité.</p>
        <p className="text-sm mt-2">Scannez le QR Code chez un commerçant partenaire ou utilisez le bouton "Ajouter un commerçant" ci-dessus !</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
      {loyaltyAccounts.map((account) => {
        if (!account.merchants) return null;

        const themeColor = account.merchants.theme_color || '#2563eb';
        const pastelBg = `${themeColor}1A`;

        return (
          <Card key={account.merchants.id} className="rounded-2xl shadow-lg border-0 transition-all hover:shadow-xl hover:-translate-y-1" style={{ background: pastelBg }}>
            <CardHeader className={isMobile ? 'pb-4' : ''}>
              <CardTitle className={`flex items-center gap-3 ${isMobile ? 'text-base' : 'text-lg'}`}>
                <Avatar className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} border-2`} style={{ borderColor: themeColor }}>
                  <AvatarFallback style={{ backgroundColor: themeColor, color: 'white' }}>
                    <Store size={isMobile ? 20 : 24} />
                  </AvatarFallback>
                </Avatar>
                <span className="font-bold">{account.merchants.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className={`font-extrabold ${isMobile ? 'text-3xl' : 'text-4xl'}`} style={{ color: themeColor }}>{account.loyalty_points}</p>
                  <p className="text-sm" style={{ color: themeColor }}>points</p>
                </div>
                <Button asChild variant="ghost" className="hover:bg-transparent" style={{ color: themeColor }}>
                  <Link to={`/tableau-de-bord-client/commercant/${account.merchants.id}`}>
                    <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>Voir détails</span>
                    <ArrowRight className={`ml-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LoyaltyCardsList;
