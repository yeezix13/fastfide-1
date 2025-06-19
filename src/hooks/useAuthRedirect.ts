
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'customer' | 'merchant' | null>(null);

  useEffect(() => {
    // Vérifier la session actuelle
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          // Déterminer le type d'utilisateur
          const { data: merchant } = await supabase
            .from('merchants')
            .select('id')
            .eq('user_id', currentUser.id)
            .single();
          
          setUserType(merchant ? 'merchant' : 'customer');
        } else {
          setUserType(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUserType('customer'); // Par défaut client en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser && event === 'SIGNED_IN') {
          // Déterminer le type d'utilisateur lors de la connexion
          try {
            const { data: merchant } = await supabase
              .from('merchants')
              .select('id')
              .eq('user_id', currentUser.id)
              .single();
            
            const type = merchant ? 'merchant' : 'customer';
            setUserType(type);
            
            // Redirection immédiate après connexion
            const targetPath = type === 'merchant' ? '/merchant-dashboard' : '/customer-dashboard';
            navigate(targetPath);
          } catch (error) {
            setUserType('customer');
            navigate('/customer-dashboard');
          }
        } else if (!currentUser) {
          setUserType(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Rediriger les utilisateurs connectés des pages publiques
  useEffect(() => {
    if (!loading && user && userType) {
      const publicPages = ['/', '/customer', '/merchant'];
      if (publicPages.includes(location.pathname)) {
        const targetPath = userType === 'merchant' ? '/merchant-dashboard' : '/customer-dashboard';
        navigate(targetPath);
      }
    }
  }, [user, userType, loading, location.pathname, navigate]);

  const redirectToDashboard = async (user: User) => {
    if (userType) {
      const targetPath = userType === 'merchant' ? '/merchant-dashboard' : '/customer-dashboard';
      navigate(targetPath);
    }
  };

  return { user, loading, userType, redirectToDashboard };
};
