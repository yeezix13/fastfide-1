import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings, Store, ArrowRight, Menu } from 'lucide-react';
import AddMerchantForm from '@/components/customer/AddMerchantForm';
import { Helmet } from 'react-helmet-async';
import { useDeviceType } from '@/hooks/useDeviceType';
import MobileSplashScreen from '@/components/mobile/MobileSplashScreen';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile, isNative } = useDeviceType();

  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        navigate('/connexion-client');
      }
      setIsLoading(false);
    };
    getUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/connexion-client');
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, client_code')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
      }
      return data;
    },
    enabled: !!user,
  });

  const { data: loyaltyAccounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['loyaltyAccounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('customer_merchant_link')
        .select(`
          loyalty_points,
          merchants (
            id,
            name,
            theme_color
          )
        `)
        .eq('customer_id', user.id);

      if (error) {
        console.error("Error fetching loyalty accounts:", error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const displayName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user?.email;

  if (isLoading) {
    return <MobileSplashScreen />;
  }

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="flex flex-col space-y-4 mt-8">
          <Button variant="outline" asChild className="justify-start">
            <Link to="/tableau-de-bord-client/preferences">
              <Settings className="mr-2 h-4 w-4" />
              Préférences
            </Link>
          </Button>
          <Button onClick={handleLogout} variant="outline" className="justify-start">
            Déconnexion
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <Helmet>
        <title>Tableau de bord - Mes cartes de fidélité</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      <div className={`container mx-auto p-4 ${isMobile ? 'pb-16 pt-6' : 'md:p-8'}`}>
        {/* Header avec logo FastFide */}
        <div className={`flex items-center justify-center ${isMobile ? 'mb-4 pt-2' : 'mb-6'}`}>
          <img 
            src="/lovable-uploads/9c24c620-d700-43f2-bb91-b498726fd2ff.png" 
            alt="FastFide" 
            className={`${isMobile ? 'h-16' : 'h-24'} w-auto`}
          />
        </div>

        <header className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-wrap gap-4 justify-between items-center'} py-4 mb-8`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>Bonjour, {displayName}</h1>
            <p className="text-muted-foreground text-sm">
              {profile?.client_code ? `Code client: ${profile.client_code}` : user.email}
            </p>
          </div>
          <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
            {isMobile ? (
              <MobileMenu />
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/tableau-de-bord-client/preferences">
                    <Settings />
                    <span>Préférences</span>
                  </Link>
                </Button>
                <Button onClick={handleLogout} variant="outline">Déconnexion</Button>
              </>
            )}
          </div>
        </header>

        <main>
          <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'} mb-4`}>
            <h2 className={`${isMobile ? 'text-lg text-center' : 'text-xl'} font-semibold`}>Mes cartes de fidélité</h2>
            <div className={`flex ${isMobile ? 'justify-center' : 'justify-end'}`}>
              {user && <AddMerchantForm userId={user.id} />}
            </div>
          </div>
          
          {isLoadingAccounts ? (
            <p className={isMobile ? 'text-center' : ''}>Chargement de vos cartes...</p>
          ) : loyaltyAccounts && loyaltyAccounts.length > 0 ? (
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
          ) : (
            <div className={`my-8 p-8 border-dashed border-2 rounded-lg text-center text-muted-foreground ${isMobile ? 'mx-4' : ''}`}>
              <p>Vous n'avez encore aucune carte de fidélité.</p>
              <p className="text-sm mt-2">Scannez le QR Code chez un commerçant partenaire ou utilisez le bouton "Ajouter un commerçant" ci-dessus !</p>
            </div>
          )}
        </main>

        {/* Navigation mobile */}
        {isMobile && (
          <MobileBottomNav userType="customer" />
        )}

        {/* Indicateur d'application native */}
        {isNative && (
          <div className="fixed bottom-16 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs z-40">
            📱 App Mobile
          </div>
        )}
      </div>
    </>
  );
};

export default CustomerDashboard;
