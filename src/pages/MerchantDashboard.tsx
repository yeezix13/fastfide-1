
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useDeviceType } from '@/hooks/useDeviceType';
import MobileSplashScreen from '@/components/mobile/MobileSplashScreen';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import MerchantDashboardHeader from '@/components/merchant/MerchantDashboardHeader';
import MerchantDashboardTabs from '@/components/merchant/MerchantDashboardTabs';
import MerchantDashboardMobile from '@/components/merchant/MerchantDashboardMobile';
import { Button } from '@/components/ui/button';

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

  const themeColor = merchant.theme_color || "#6366f1";

  return (
    <>
      <Helmet>
        <title>Tableau de bord - {merchant.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      <div className="min-h-screen bg-[#f8f9fb] pb-16 md:pb-0">
        <div className={`container mx-auto p-0 pt-1 ${isMobile ? 'md:p-4' : 'md:p-4'}`}>
          <MerchantDashboardHeader merchant={merchant} onLogout={handleLogout} />
          
          <main>
            <p className={`text-muted-foreground mb-8 px-4 md:px-8 ${isMobile ? 'text-base text-center' : 'text-lg'}`}>
              Bienvenue sur votre tableau de bord.
            </p>
            
            <div className="w-full mx-auto rounded-xl p-0 pt-0">
              {isMobile ? (
                <MerchantDashboardMobile 
                  merchant={merchant} 
                  themeColor={themeColor} 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab} 
                />
              ) : (
                <MerchantDashboardTabs 
                  merchant={merchant} 
                  themeColor={themeColor} 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab} 
                />
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
