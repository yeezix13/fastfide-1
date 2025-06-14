
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings, Store, ArrowRight } from 'lucide-react';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        navigate('/connexion-client');
      }
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
        .select('first_name, last_name, phone')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') { // Ignore error when no profile is found
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
            name
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

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex flex-wrap gap-4 justify-between items-center py-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Bonjour, {displayName}</h1>
          <p className="text-muted-foreground">{profile?.phone || user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/tableau-de-bord-client/preferences">
              <Settings />
              <span>Préférences</span>
            </Link>
          </Button>
          <Button onClick={handleLogout} variant="outline">Déconnexion</Button>
        </div>
      </header>
      <main>
        <h2 className="text-xl font-semibold mb-4">Mes cartes de fidélité</h2>
        {isLoadingAccounts ? (
          <p>Chargement de vos cartes...</p>
        ) : loyaltyAccounts && loyaltyAccounts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loyaltyAccounts.map((account) => (
              account.merchants && (
                <Card key={account.merchants.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Avatar>
                         <AvatarFallback>
                           <Store />
                         </AvatarFallback>
                      </Avatar>
                      <span>{account.merchants.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-2xl">{account.loyalty_points}</p>
                        <p className="text-sm text-muted-foreground">points</p>
                      </div>
                      <Button asChild variant="ghost">
                        <Link to={`/tableau-de-bord-client/commercant/${account.merchants.id}`}>
                          Voir détails <ArrowRight className="ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        ) : (
          <div className="my-8 p-8 border-dashed border-2 rounded-lg text-center text-muted-foreground">
            <p>Vous n'avez encore aucune carte de fidélité.</p>
            <p className="text-sm mt-2">Scannez le QR Code chez un commerçant partenaire pour commencer !</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerDashboard;
