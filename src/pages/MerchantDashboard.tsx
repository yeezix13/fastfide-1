
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: merchant } = await supabase
          .from('merchants')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        if (merchant) {
          setUser(session.user);
        } else {
          await supabase.auth.signOut();
          navigate('/connexion-commercant');
        }
      } else {
        navigate('/connexion-commercant');
      }
    };
    checkUser();

     const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/connexion-commercant');
      } else if (session?.user) {
        // Re-check if user is still a merchant on auth change
        checkUser();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="container mx-auto p-4">
       <header className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold">Tableau de bord Commerçant</h1>
        <Button onClick={handleLogout} variant="outline">Déconnexion</Button>
      </header>
      <main>
        <p>Bienvenue, {user.email}</p>
        <div className="my-8 p-8 border-dashed border-2 rounded-lg text-center text-muted-foreground">
          <p>Le contenu du tableau de bord sera ajouté ici.</p>
        </div>
      </main>
    </div>
  );
};

export default MerchantDashboard;
