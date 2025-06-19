
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthPersistence = () => {
  useEffect(() => {
    // Configuration pour améliorer la persistance de session
    const configureAuth = async () => {
      // Force la persistance de session
      await supabase.auth.getSession();
      
      // Écoute les changements d'état d'authentification
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Stockage local pour une meilleure persistance sur mobile
        if (session) {
          localStorage.setItem('fastfide_auth_session', JSON.stringify({
            user: session.user,
            expires_at: session.expires_at
          }));
        } else {
          localStorage.removeItem('fastfide_auth_session');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    configureAuth();
  }, []);
};
