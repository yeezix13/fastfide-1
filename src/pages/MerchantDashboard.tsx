import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import RecordVisitForm from '@/components/merchant/RecordVisitForm';
import RedeemRewardForm from '@/components/merchant/RedeemRewardForm';
import LoyaltySettings from '@/components/merchant/LoyaltySettings';
import MerchantProfileForm from '@/components/merchant/MerchantProfileForm';
import CustomerList from '@/components/merchant/CustomerList';
import MerchantStats from '@/components/merchant/MerchantStats';
import MerchantLogo from '@/components/ui/merchant-logo';
import { LogOut, UserPlus } from "lucide-react";
import { Helmet } from 'react-helmet-async';
import MerchantAnalytics from '@/components/merchant/MerchantAnalytics';

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/merchant');
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/merchant');
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);
  
  const { data: merchant, isLoading: isLoadingMerchant, error: merchantError } = useQuery({
    queryKey: ['merchantDetails', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) {
        console.error("Merchant fetch error:", error);
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!user,
    retry: 1,
  });

  useEffect(() => {
    if (merchantError) {
      supabase.auth.signOut();
    }
  }, [merchantError, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (isLoadingMerchant || !user) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }
  
  if (!merchant) {
     return (
      <div className="flex h-screen items-center justify-center text-center p-4">
        <div>
            <p className="mb-4">Impossible de charger les données du commerçant. Vous allez être déconnecté.</p>
            <Button onClick={handleLogout}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  // Couleur personnalisée du commerçant
  const themeColor = merchant.theme_color || "#6366f1";
  const lightBg = `${themeColor}17`; // hex + alpha pour effet "pastel"

  return (
    <>
      <Helmet>
        <title>Tableau de bord - {merchant.name}</title>
      </Helmet>
      <div className="min-h-screen bg-[#f8f9fb]">
        <div className="container mx-auto p-0 pt-1 md:p-4">
          <header className="flex justify-between items-center py-6 px-4 md:px-8 rounded-b-lg bg-white shadow-md mb-8">
            <div className="flex items-center gap-4">
              <MerchantLogo 
                logoUrl={merchant.logo_url} 
                merchantName={merchant.name} 
                size="lg"
              />
              <h1
                className="text-3xl md:text-4xl font-bold tracking-tight"
                style={{ color: themeColor }}
              >
                {merchant.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                style={{
                  backgroundColor: themeColor,
                  borderColor: themeColor,
                }}
                className="text-white hover:opacity-90"
              >
                <Link to="/merchant-dashboard/register-customer">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Inscrire un client
                </Link>
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                style={{
                  color: themeColor,
                  borderColor: themeColor,
                  background: lightBg,
                  fontWeight: 600,
                }}
                className="hover:bg-opacity-15 flex items-center gap-2 shadow-none"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </Button>
            </div>
          </header>
          <main>
            <p className="text-muted-foreground mb-8 px-4 md:px-8 text-lg">Bienvenue sur votre tableau de bord.</p>
            
            <div className="w-full mx-auto rounded-xl p-0 pt-0">
              <Tabs defaultValue="actions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white rounded-xl shadow-sm mb-8">
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
                    Statistiques
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    style={{ color: themeColor }}
                    className="data-[state=active]:bg-[var(--themeColor)] data-[state=active]:text-white data-[state=active]:font-bold px-4"
                  >
                    Analytics
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
                  <div className="grid md:grid-cols-2 gap-8 px-2 md:px-0">
                    <Card className="rounded-2xl shadow-lg border-0 bg-white">
                      <CardHeader>
                        <CardTitle style={{ color: themeColor, fontSize: 22, fontWeight: 800 }}>
                          Enregistrer une visite
                        </CardTitle>
                        <CardDescription>Ajoutez des points à un client après un achat.</CardDescription>
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
                        <CardDescription>Permettez à un client d'utiliser ses points.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <RedeemRewardForm merchant={merchant} themeColor={themeColor} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="analytics" className="mt-0">
                  <div className="px-2 md:px-0">
                    <MerchantAnalytics merchantId={merchant.id} themeColor={themeColor} />
                  </div>
                </TabsContent>
                <TabsContent value="settings" className="mt-0">
                  <div className="grid md:grid-cols-2 gap-8 px-2 md:px-0">
                    <Card className="rounded-2xl shadow-lg border-0 bg-white">
                      <CardHeader>
                        <CardTitle style={{ color: themeColor, fontSize: 22, fontWeight: 800 }}>Règles & Récompenses</CardTitle>
                        <CardDescription>Gérez comment vos clients gagnent et utilisent des points.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <LoyaltySettings merchant={merchant} themeColor={themeColor} />
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl shadow-lg border-0 bg-white">
                      <CardHeader>
                        <CardTitle style={{ color: themeColor, fontSize: 22, fontWeight: 800 }}>Informations du commerce</CardTitle>
                        <CardDescription>Modifiez vos coordonnées ici.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <MerchantProfileForm merchant={merchant} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="customers" className="mt-0">
                  <div className="px-2 md:px-0">
                    <CustomerList merchant={merchant} themeColor={themeColor} />
                  </div>
                </TabsContent>
                <TabsContent value="stats" className="mt-0">
                  <div className="px-2 md:px-0">
                    <MerchantStats merchant={merchant} themeColor={themeColor} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default MerchantDashboard;
