
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthPersistence = () => {
  useEffect(() => {
    // Configuration pour améliorer la persistance de session
    const configureAuth = async () => {
      try {
        // Force la persistance de session au démarrage
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        console.log('Session restored:', session?.user?.email || 'No session');
        
        // Écoute les changements d'état d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          
          // Stockage local pour une meilleure persistance sur mobile
          if (session) {
            const sessionData = {
              user: session.user,
              expires_at: session.expires_at,
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              timestamp: Date.now()
            };
            localStorage.setItem('fastfide_auth_session', JSON.stringify(sessionData));
            
            // Stocker également dans sessionStorage pour une double sécurité
            sessionStorage.setItem('fastfide_user_authenticated', 'true');
          } else {
            localStorage.removeItem('fastfide_auth_session');
            sessionStorage.removeItem('fastfide_user_authenticated');
          }
        });

        // Restaurer la session depuis localStorage si elle existe
        const storedSession = localStorage.getItem('fastfide_auth_session');
        if (storedSession && !session) {
          try {
            const parsedSession = JSON.parse(storedSession);
            const isExpired = parsedSession.expires_at && new Date(parsedSession.expires_at * 1000) < new Date();
            
            if (!isExpired) {
              console.log('Attempting to restore session from localStorage');
              await supabase.auth.setSession({
                access_token: parsedSession.access_token,
                refresh_token: parsedSession.refresh_token
              });
            } else {
              console.log('Stored session expired, removing');
              localStorage.removeItem('fastfide_auth_session');
            }
          } catch (error) {
            console.error('Error parsing stored session:', error);
            localStorage.removeItem('fastfide_auth_session');
          }
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth configuration error:', error);
      }
    };

    configureAuth();
  }, []);
};
