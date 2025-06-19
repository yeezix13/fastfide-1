
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthPersistence = () => {
  useEffect(() => {
    const configureAuth = async () => {
      try {
        // Force session restoration on app startup
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        console.log('Session status:', session?.user?.email || 'No active session');
        
        // Enhanced auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth event:', event, session?.user?.email);
          
          if (session) {
            // Store complete session data with timestamp
            const sessionData = {
              user: session.user,
              expires_at: session.expires_at,
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              timestamp: Date.now(),
              last_refresh: Date.now()
            };
            
            localStorage.setItem('fastfide_auth_session', JSON.stringify(sessionData));
            localStorage.setItem('fastfide_user_id', session.user.id);
            sessionStorage.setItem('fastfide_active', 'true');
            
            console.log('Session stored successfully');
          } else {
            // Clear all auth data
            localStorage.removeItem('fastfide_auth_session');
            localStorage.removeItem('fastfide_user_id');
            sessionStorage.removeItem('fastfide_active');
            console.log('Session cleared');
          }
        });

        // Attempt to restore session from localStorage if no current session
        if (!session) {
          const storedSession = localStorage.getItem('fastfide_auth_session');
          const storedUserId = localStorage.getItem('fastfide_user_id');
          
          if (storedSession && storedUserId) {
            try {
              const parsedSession = JSON.parse(storedSession);
              const now = Date.now();
              const sessionAge = now - (parsedSession.timestamp || 0);
              const maxAge = 24 * 60 * 60 * 1000; // 24 hours
              
              // Check if session is not too old and not expired
              const isExpired = parsedSession.expires_at && new Date(parsedSession.expires_at * 1000) < new Date();
              const isTooOld = sessionAge > maxAge;
              
              if (!isExpired && !isTooOld && parsedSession.access_token && parsedSession.refresh_token) {
                console.log('Attempting to restore stored session...');
                
                const { data, error } = await supabase.auth.setSession({
                  access_token: parsedSession.access_token,
                  refresh_token: parsedSession.refresh_token
                });
                
                if (error) {
                  console.error('Session restoration failed:', error);
                  localStorage.removeItem('fastfide_auth_session');
                  localStorage.removeItem('fastfide_user_id');
                } else {
                  console.log('Session restored successfully');
                }
              } else {
                console.log('Stored session expired or invalid, removing...');
                localStorage.removeItem('fastfide_auth_session');
                localStorage.removeItem('fastfide_user_id');
              }
            } catch (error) {
              console.error('Error parsing stored session:', error);
              localStorage.removeItem('fastfide_auth_session');
              localStorage.removeItem('fastfide_user_id');
            }
          }
        }

        // Periodic session refresh check
        const refreshInterval = setInterval(async () => {
          const currentSession = await supabase.auth.getSession();
          if (currentSession.data.session) {
            const expiresAt = currentSession.data.session.expires_at;
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
            
            // Refresh if session expires in less than 5 minutes
            if (timeUntilExpiry < 300) {
              console.log('Refreshing session proactively...');
              await supabase.auth.refreshSession();
            }
          }
        }, 60000); // Check every minute

        return () => {
          subscription.unsubscribe();
          clearInterval(refreshInterval);
        };
      } catch (error) {
        console.error('Auth configuration error:', error);
      }
    };

    configureAuth();
  }, []);
};
