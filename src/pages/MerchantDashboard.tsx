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
import { LogOut, UserPlus, Menu, ArrowLeft } from "lucide-react";
import { Helmet } from 'react-helmet-async';
import { useDeviceType } from '@/hooks/useDeviceType';
import MobileSplashScreen from '@/components/mobile/MobileSplashScreen';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('actions');
  const { isMobile, isNative } = useDeviceType();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/connexion-commercant');
      }
      setIsLoading(false);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/connexion-commercant');
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

  if (isLoading || isLoadingMerchant) {
    return <MobileSplashScreen />;
  }

  if (!user) {
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

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="flex flex-col space-y-4 mt-8">
          <Button
            asChild
            style={{
              backgroundColor: themeColor,
              borderColor: themeColor,
            }}
            className="text-white hover:opacity-90 justify-start"
          >
            <Link to="/tableau-de-bord-commercant/inscrire-client">
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
            className="hover:bg-opacity-15 justify-start"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Déconnexion
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <Helmet>
        <title>Tableau de bord - {merchant.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      <div className="min-h-screen bg-[#f8f9fb] pb-20 md:pb-0">
        <div className={`container mx-auto p-0 pt-1 ${isMobile ? 'md:p-4' : 'md:p-4'}`}>
          <header className={`flex ${isMobile ? 'flex-col space-y-4 pt-6 pb-4' : 'justify-between items-center'} py-6 px-4 md:px-8 rounded-b-lg bg-white shadow-md mb-8`}>
            <div className={`flex items-center gap-4 ${isMobile ? 'justify-center' : ''}`}>
              <MerchantLogo 
                logoUrl={merchant.logo_url} 
                merchantName={merchant.name} 
                size={isMobile ? "md" : "lg"}
              />
              <h1
                className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold tracking-tight`}
                style={{ color: themeColor }}
              >
                {merchant.name}
              </h1>
            </div>
            <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
              {isMobile ? (
                <MobileMenu />
              ) : (
                <>
                  <Button
                    asChild
                    style={{
                      backgroundColor: themeColor,
                      borderColor: themeColor,
                    }}
                    className="text-white hover:opacity-90"
                  >
                    <Link to="/tableau-de-bord-commercant/inscrire-client">
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
                </>
              )}
            </div>
          </header>
          <main>
            <p className={`text-muted-foreground mb-8 px-4 md:px-8 ${isMobile ? 'text-base text-center' : 'text-lg'}`}>
              Bienvenue sur votre tableau de bord.
            </p>
            
            <div className="w-full mx-auto rounded-xl p-0 pt-0">
              {isMobile ? (
                // Interface mobile avec boutons cards
                <div className="px-4 space-y-6">
                  {/* Actions rapides */}
                  <div className="grid grid-cols-1 gap-4">
                    <Card 
                      className="rounded-2xl shadow-lg border-0 bg-white cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => setActiveTab('actions')}
                    >
                      <CardHeader className="text-center py-6">
                        <CardTitle style={{ color: themeColor, fontSize: 20, fontWeight: 800 }}>
                          ⚡ Actions rapides
                        </CardTitle>
                        <CardDescription>
                          Enregistrer visite • Utiliser récompense
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    
                    <Card 
                      className="rounded-2xl shadow-lg border-0 bg-white cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => setActiveTab('stats')}
                    >
                      <CardHeader className="text-center py-6">
                        <CardTitle style={{ color: themeColor, fontSize: 20, fontWeight: 800 }}>
                          📊 Statistiques
                        </CardTitle>
                        <CardDescription>
                          Aperçu de votre activité
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    
                    <Card 
                      className="rounded-2xl shadow-lg border-0 bg-white cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => setActiveTab('customers')}
                    >
                      <CardHeader className="text-center py-6">
                        <CardTitle style={{ color: themeColor, fontSize: 20, fontWeight: 800 }}>
                          👥 Mes clients
                        </CardTitle>
                        <CardDescription>
                          Liste et gestion des clients
                        </CardDescription>
                      </CardHeader>
                    </Card>
                    
                    <Card 
                      className="rounded-2xl shadow-lg border-0 bg-white cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => setActiveTab('settings')}
                    >
                      <CardHeader className="text-center py-6">
                        <CardTitle style={{ color: themeColor, fontSize: 20, fontWeight: 800 }}>
                          ⚙️ Réglages
                        </CardTitle>
                        <CardDescription>
                          Configuration et profil
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Contenu conditionnel */}
                  {activeTab !== 'main' && (
                    <div className="mt-8">
                      <div className="flex items-center mb-4">
                        <Button
                          variant="ghost"
                          onClick={() => setActiveTab('main')}
                          className="mr-3"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="text-xl font-bold" style={{ color: themeColor }}>
                          {activeTab === 'actions' && 'Actions rapides'}
                          {activeTab === 'stats' && 'Statistiques'}
                          {activeTab === 'customers' && 'Mes clients'}
                          {activeTab === 'settings' && 'Réglages'}
                        </h2>
                      </div>

                      {activeTab === 'actions' && (
                        <div className="grid grid-cols-1 gap-4">
                          <Card className="rounded-2xl shadow-lg border-0 bg-white">
                            <CardHeader>
                              <CardTitle style={{ color: themeColor, fontSize: 18, fontWeight: 800 }}>
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
                          <Card className="rounded-2xl shadow-lg border-0 bg-white">
                            <CardHeader>
                              <CardTitle style={{ color: themeColor, fontSize: 18, fontWeight: 800 }}>
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
                          <Card className="rounded-2xl shadow-lg border-0 bg-white">
                            <CardHeader>
                              <CardTitle style={{ color: themeColor, fontSize: 18, fontWeight: 800 }}>
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
                          <Card className="rounded-2xl shadow-lg border-0 bg-white">
                            <CardHeader>
                              <CardTitle style={{ color: themeColor, fontSize: 18, fontWeight: 800 }}>
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
              ) : (
                // Interface desktop avec tabs
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              )}
            </div>
          </main>

          {/* Navigation mobile en bas */}
          {isMobile && (
            <MobileBottomNav userType="merchant" themeColor={themeColor} />
          )}

          {/* Indicateur d'application native */}
          {isNative && (
            <div className="fixed bottom-20 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs z-40 md:bottom-4">
              📱 App Mobile
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MerchantDashboard;
