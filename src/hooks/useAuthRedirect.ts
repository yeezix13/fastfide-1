
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session actuelle
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);

        // Redirection après connexion
        if (event === 'SIGNED_IN' && session?.user) {
          await redirectToDashboard(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const redirectToDashboard = async (user: User) => {
    try {
      // Vérifier si l'utilisateur est un commerçant
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (merchant) {
        navigate('/merchant-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    } catch (error) {
      // Si erreur, considérer comme client par défaut
      navigate('/customer-dashboard');
    }
  };

  // Rediriger les utilisateurs connectés des pages publiques
  useEffect(() => {
    if (!loading && user) {
      const publicPages = ['/', '/customer', '/merchant'];
      if (publicPages.includes(location.pathname)) {
        redirectToDashboard(user);
      }
    }
  }, [user, loading, location.pathname]);

  return { user, loading, redirectToDashboard };
};
