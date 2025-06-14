import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
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

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/connexion-commercant');
      }
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

  return (
    <div className="container mx-auto p-4">
       <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold">{merchant.name}</h1>
        <Button onClick={handleLogout} variant="outline">Déconnexion</Button>
      </header>
      <main>
        <p className="text-muted-foreground mb-6">Bienvenue sur votre tableau de bord.</p>
        
        <Tabs defaultValue="actions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="customers">Clients</TabsTrigger>
            <TabsTrigger value="settings">Réglages</TabsTrigger>
          </TabsList>
          <TabsContent value="actions" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enregistrer une visite</CardTitle>
                  <CardDescription>Ajoutez des points à un client après un achat.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecordVisitForm merchant={merchant} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Utiliser une récompense</CardTitle>
                  <CardDescription>Permettez à un client d'utiliser ses points.</CardDescription>
                </CardHeader>
                <CardContent>
                   <RedeemRewardForm merchant={merchant} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="settings" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Règles & Récompenses</CardTitle>
                        <CardDescription>Gérez comment vos clients gagnent et utilisent des points.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoyaltySettings merchant={merchant} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Informations du commerce</CardTitle>
                        <CardDescription>Modifiez vos coordonnées ici.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MerchantProfileForm merchant={merchant} />
                    </CardContent>
                </Card>
            </div>
          </TabsContent>
          <TabsContent value="customers" className="mt-6">
            <CustomerList merchant={merchant} />
          </TabsContent>
          <TabsContent value="stats" className="mt-6">
             <MerchantStats merchant={merchant} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MerchantDashboard;
