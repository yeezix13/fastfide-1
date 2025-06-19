
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import RecordVisitForm from '@/components/merchant/RecordVisitForm';
import RedeemRewardForm from '@/components/merchant/RedeemRewardForm';
import LoyaltySettings from '@/components/merchant/LoyaltySettings';
import MerchantProfileForm from '@/components/merchant/MerchantProfileForm';
import CustomerList from '@/components/merchant/CustomerList';
import MerchantStats from '@/components/merchant/MerchantStats';

interface MerchantDashboardMobileProps {
  merchant: any;
  themeColor: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MerchantDashboardMobile = ({ merchant, themeColor, activeTab, onTabChange }: MerchantDashboardMobileProps) => {
  return (
    <div className="px-4 space-y-4">
      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-3">
        <Card 
          className="rounded-xl shadow-md border-0 bg-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onTabChange('actions')}
        >
          <CardHeader className="text-center py-4">
            <CardTitle style={{ color: themeColor, fontSize: 16, fontWeight: 700 }}>
              ⚡ Actions
            </CardTitle>
            <CardDescription className="text-xs">
              Enregistrer • Récompense
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className="rounded-xl shadow-md border-0 bg-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onTabChange('stats')}
        >
          <CardHeader className="text-center py-4">
            <CardTitle style={{ color: themeColor, fontSize: 16, fontWeight: 700 }}>
              📊 Stats
            </CardTitle>
            <CardDescription className="text-xs">
              Votre activité
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className="rounded-xl shadow-md border-0 bg-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onTabChange('customers')}
        >
          <CardHeader className="text-center py-4">
            <CardTitle style={{ color: themeColor, fontSize: 16, fontWeight: 700 }}>
              👥 Clients
            </CardTitle>
            <CardDescription className="text-xs">
              Liste des clients
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card 
          className="rounded-xl shadow-md border-0 bg-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onTabChange('settings')}
        >
          <CardHeader className="text-center py-4">
            <CardTitle style={{ color: themeColor, fontSize: 16, fontWeight: 700 }}>
              ⚙️ Réglages
            </CardTitle>
            <CardDescription className="text-xs">
              Configuration
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Contenu conditionnel */}
      {activeTab !== 'main' && (
        <div className="mt-6">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              onClick={() => onTabChange('main')}
              className="mr-3"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-bold" style={{ color: themeColor }}>
              {activeTab === 'actions' && 'Actions rapides'}
              {activeTab === 'stats' && 'Statistiques'}
              {activeTab === 'customers' && 'Mes clients'}
              {activeTab === 'settings' && 'Réglages'}
            </h2>
          </div>

          {activeTab === 'actions' && (
            <div className="grid grid-cols-1 gap-4">
              <Card className="rounded-xl shadow-md border-0 bg-white">
                <CardHeader>
                  <CardTitle style={{ color: themeColor, fontSize: 16, fontWeight: 700 }}>
                    Enregistrer une visite
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Ajoutez des points à un client après un achat.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecordVisitForm merchant={merchant} themeColor={themeColor} />
                </CardContent>
              </Card>
              <Card className="rounded-xl shadow-md border-0 bg-white">
                <CardHeader>
                  <CardTitle style={{ color: themeColor, fontSize: 16, fontWeight: 700 }}>
                    Utiliser une récompense
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Permettez à un client d'utiliser ses points.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RedeemRewardForm merchant={merchant} themeColor={themeColor} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'stats' && (
            <MerchantStats merchant={merchant} themeColor={themeColor} />
          )}

          {activeTab === 'customers' && (
            <CustomerList merchant={merchant} themeColor={themeColor} />
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 gap-4">
              <Card className="rounded-xl shadow-md border-0 bg-white">
                <CardHeader>
                  <CardTitle style={{ color: themeColor, fontSize: 16, fontWeight: 700 }}>
                    Règles & Récompenses
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Gérez comment vos clients gagnent et utilisent des points.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LoyaltySettings merchant={merchant} themeColor={themeColor} />
                </CardContent>
              </Card>
              <Card className="rounded-xl shadow-md border-0 bg-white">
                <CardHeader>
                  <CardTitle style={{ color: themeColor, fontSize: 16, fontWeight: 700 }}>
                    Informations du commerce
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Modifiez vos coordonnées ici.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MerchantProfileForm merchant={merchant} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MerchantDashboardMobile;
