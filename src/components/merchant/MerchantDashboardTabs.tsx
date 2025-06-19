
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import RecordVisitForm from '@/components/merchant/RecordVisitForm';
import RedeemRewardForm from '@/components/merchant/RedeemRewardForm';
import LoyaltySettings from '@/components/merchant/LoyaltySettings';
import MerchantProfileForm from '@/components/merchant/MerchantProfileForm';
import CustomerList from '@/components/merchant/CustomerList';
import MerchantStats from '@/components/merchant/MerchantStats';

interface MerchantDashboardTabsProps {
  merchant: any;
  themeColor: string;
  activeTab: string;
  onTabChange: (value: string) => void;
}

const MerchantDashboardTabs = ({ merchant, themeColor, activeTab, onTabChange }: MerchantDashboardTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white rounded-xl shadow-sm mb-8">
        <TabsTrigger
          value="actions"
          style={{ color: themeColor }}
          className="data-[state=active]:bg-[var(--themeColor)] data-[state=active]:text-white data-[state=active]:font-bold px-4"
        >
          Actions
        </TabsTrigger>
        <TabsTrigger
          value="stats"
          style={{ color: themeColor }}
          className="data-[state=active]:bg-[var(--themeColor)] data-[state=active]:text-white data-[state=active]:font-bold px-4"
        >
          Stats
        </TabsTrigger>
        <TabsTrigger
          value="customers"
          style={{ color: themeColor }}
          className="data-[state=active]:bg-[var(--themeColor)] data-[state=active]:text-white data-[state=active]:font-bold px-4"
        >
          Clients
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          style={{ color: themeColor }}
          className="data-[state=active]:bg-[var(--themeColor)] data-[state=active]:text-white data-[state=active]:font-bold px-4"
        >
          Réglages
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="actions" className="mt-0">
        <div className="grid md:grid-cols-2 gap-8 px-0">
          <Card className="rounded-2xl shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle style={{ color: themeColor, fontSize: 22, fontWeight: 800 }}>
                Enregistrer une visite
              </CardTitle>
              <CardDescription>
                Ajoutez des points à un client après un achat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecordVisitForm merchant={merchant} themeColor={themeColor} />
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle style={{ color: themeColor, fontSize: 22, fontWeight: 800 }}>
                Utiliser une récompense
              </CardTitle>
              <CardDescription>
                Permettez à un client d'utiliser ses points.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RedeemRewardForm merchant={merchant} themeColor={themeColor} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="settings" className="mt-0">
        <div className="grid md:grid-cols-2 gap-8 px-0">
          <Card className="rounded-2xl shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle style={{ color: themeColor, fontSize: 22, fontWeight: 800 }}>
                Règles & Récompenses
              </CardTitle>
              <CardDescription>
                Gérez comment vos clients gagnent et utilisent des points.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoyaltySettings merchant={merchant} themeColor={themeColor} />
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle style={{ color: themeColor, fontSize: 22, fontWeight: 800 }}>
                Informations du commerce
              </CardTitle>
              <CardDescription>
                Modifiez vos coordonnées ici.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MerchantProfileForm merchant={merchant} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="customers" className="mt-0">
        <div className="px-0">
          <CustomerList merchant={merchant} themeColor={themeColor} />
        </div>
      </TabsContent>
      <TabsContent value="stats" className="mt-0">
        <div className="px-0">
          <MerchantStats merchant={merchant} themeColor={themeColor} />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default MerchantDashboardTabs;
