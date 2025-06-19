
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'customer' | 'merchant' | null>(null);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const checkAndRedirect = (currentUser: User | null, type: 'customer' | 'merchant' | null) => {
      if (!isMounted) return;
      
      if (currentUser && type && !hasRedirectedRef.current) {
        const publicPages = ['/', '/customer', '/merchant'];
        if (publicPages.includes(location.pathname)) {
          const targetPath = type === 'merchant' ? '/merchant-dashboard' : '/customer-dashboard';
          hasRedirectedRef.current = true;
          navigate(targetPath, { replace: true });
        }
      }
    };

    // Vérifier la session actuelle
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        
        if (!isMounted) return;
        setUser(currentUser);
        
        if (currentUser) {
          // Déterminer le type d'utilisateur
          const { data: merchant } = await supabase
            .from('merchants')
            .select('id')
            .eq('user_id', currentUser.id)
            .single();
          
          const type = merchant ? 'merchant' : 'customer';
          if (!isMounted) return;
          setUserType(type);
          checkAndRedirect(currentUser, type);
        } else {
          if (!isMounted) return;
          setUserType(null);
          hasRedirectedRef.current = false;
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (!isMounted) return;
        setUserType('customer');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser && event === 'SIGNED_IN') {
          try {
            const { data: merchant } = await supabase
              .from('merchants')
              .select('id')
              .eq('user_id', currentUser.id)
              .single();
            
            const type = merchant ? 'merchant' : 'customer';
            if (!isMounted) return;
            setUserType(type);
            
            // Redirection après connexion
            const targetPath = type === 'merchant' ? '/merchant-dashboard' : '/customer-dashboard';
            navigate(targetPath, { replace: true });
          } catch (error) {
            if (!isMounted) return;
            setUserType('customer');
            navigate('/customer-dashboard', { replace: true });
          }
        } else if (!currentUser) {
          if (!isMounted) return;
          setUserType(null);
          hasRedirectedRef.current = false;
        }
        
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const redirectToDashboard = async (user: User) => {
    if (userType) {
      const targetPath = userType === 'merchant' ? '/merchant-dashboard' : '/customer-dashboard';
      navigate(targetPath, { replace: true });
    }
  };

  return { user, loading, userType, redirectToDashboard };
};
