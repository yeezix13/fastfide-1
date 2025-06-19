
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import AddMerchantForm from '@/components/customer/AddMerchantForm';
import { Helmet } from 'react-helmet-async';
import { useDeviceType } from '@/hooks/useDeviceType';
import MobileSplashScreen from '@/components/mobile/MobileSplashScreen';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import CustomerDashboardHeader from '@/components/customer/CustomerDashboardHeader';
import LoyaltyCardsList from '@/components/customer/LoyaltyCardsList';

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

        <CustomerDashboardHeader
          displayName={displayName || ''}
          clientCode={profile?.client_code}
          email={user.email || ''}
          onLogout={handleLogout}
        />

        <main>
          <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between items-center'} mb-4`}>
            <h2 className={`${isMobile ? 'text-lg text-center' : 'text-xl'} font-semibold`}>Mes cartes de fidélité</h2>
            <div className={`flex ${isMobile ? 'justify-center' : 'justify-end'}`}>
              {user && <AddMerchantForm userId={user.id} />}
            </div>
          </div>
          
          <LoyaltyCardsList loyaltyAccounts={loyaltyAccounts || []} isLoading={isLoadingAccounts} />
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
