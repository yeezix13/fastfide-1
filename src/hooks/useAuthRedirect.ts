
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
  const [hasRedirected, setHasRedirected] = useState(false);

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
          
          const type = merchant ? 'merchant' : 'customer';
          setUserType(type);
          
          // Redirection immédiate si on est sur une page publique
          const publicPages = ['/', '/customer', '/merchant'];
          if (publicPages.includes(location.pathname) && !hasRedirected) {
            const targetPath = type === 'merchant' ? '/merchant-dashboard' : '/customer-dashboard';
            setHasRedirected(true);
            navigate(targetPath, { replace: true });
          }
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
            navigate(targetPath, { replace: true });
          } catch (error) {
            setUserType('customer');
            navigate('/customer-dashboard', { replace: true });
          }
        } else if (!currentUser) {
          setUserType(null);
          setHasRedirected(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname, hasRedirected]);

  const redirectToDashboard = async (user: User) => {
    if (userType) {
      const targetPath = userType === 'merchant' ? '/merchant-dashboard' : '/customer-dashboard';
      navigate(targetPath, { replace: true });
    }
  };

  return { user, loading, userType, redirectToDashboard };
};
