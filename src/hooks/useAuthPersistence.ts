
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthPersistence = () => {
  useEffect(() => {
    const configureAuth = async () => {
      try {
        // Enhanced persistence for mobile
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        console.log('Session status:', session?.user?.email || 'No active session');
        
        // Enhanced auth state change listener with better mobile persistence
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth event:', event, session?.user?.email);
          
          if (session) {
            // Enhanced session storage for mobile apps
            const sessionData = {
              user: session.user,
              expires_at: session.expires_at,
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              timestamp: Date.now(),
              last_refresh: Date.now(),
              user_agent: navigator.userAgent,
              is_mobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            };
            
            // Use both localStorage and sessionStorage for better persistence
            localStorage.setItem('fastfide_auth_session', JSON.stringify(sessionData));
            sessionStorage.setItem('fastfide_auth_session', JSON.stringify(sessionData));
            localStorage.setItem('fastfide_user_id', session.user.id);
            sessionStorage.setItem('fastfide_user_id', session.user.id);
            sessionStorage.setItem('fastfide_active', 'true');
            
            // Mobile-specific persistence
            if (sessionData.is_mobile) {
              localStorage.setItem('fastfide_mobile_session', 'true');
            }
            
            console.log('Session stored successfully with mobile persistence');
          } else {
            // Clear all auth data
            localStorage.removeItem('fastfide_auth_session');
            localStorage.removeItem('fastfide_user_id');
            localStorage.removeItem('fastfide_mobile_session');
            sessionStorage.removeItem('fastfide_auth_session');
            sessionStorage.removeItem('fastfide_user_id');
            sessionStorage.removeItem('fastfide_active');
            console.log('Session cleared');
          }
        });

        // Enhanced session restoration with mobile priority
        if (!session) {
          // Try localStorage first (better for mobile)
          let storedSession = localStorage.getItem('fastfide_auth_session');
          let storedUserId = localStorage.getItem('fastfide_user_id');
          
          // Fallback to sessionStorage
          if (!storedSession) {
            storedSession = sessionStorage.getItem('fastfide_auth_session');
            storedUserId = sessionStorage.getItem('fastfide_user_id');
          }
          
          if (storedSession && storedUserId) {
            try {
              const parsedSession = JSON.parse(storedSession);
              const now = Date.now();
              const sessionAge = now - (parsedSession.timestamp || 0);
              const maxAge = 7 * 24 * 60 * 60 * 1000; // Extended to 7 days for mobile
              
              // Check if session is not too old and not expired
              const isExpired = parsedSession.expires_at && new Date(parsedSession.expires_at * 1000) < new Date();
              const isTooOld = sessionAge > maxAge;
              
              if (!isExpired && !isTooOld && parsedSession.access_token && parsedSession.refresh_token) {
                console.log('Attempting to restore stored session for mobile...');
                
                const { data, error } = await supabase.auth.setSession({
                  access_token: parsedSession.access_token,
                  refresh_token: parsedSession.refresh_token
                });
                
                if (error) {
                  console.error('Session restoration failed:', error);
                  // Clear invalid sessions
                  localStorage.removeItem('fastfide_auth_session');
                  localStorage.removeItem('fastfide_user_id');
                  sessionStorage.removeItem('fastfide_auth_session');
                  sessionStorage.removeItem('fastfide_user_id');
                } else {
                  console.log('Session restored successfully for mobile');
                }
              } else {
                console.log('Stored session expired or invalid, removing...');
                localStorage.removeItem('fastfide_auth_session');
                localStorage.removeItem('fastfide_user_id');
                sessionStorage.removeItem('fastfide_auth_session');
                sessionStorage.removeItem('fastfide_user_id');
              }
            } catch (error) {
              console.error('Error parsing stored session:', error);
              localStorage.removeItem('fastfide_auth_session');
              localStorage.removeItem('fastfide_user_id');
              sessionStorage.removeItem('fastfide_auth_session');
              sessionStorage.removeItem('fastfide_user_id');
            }
          }
        }

        // More frequent refresh checks for mobile (every 30 seconds)
        const refreshInterval = setInterval(async () => {
          const currentSession = await supabase.auth.getSession();
          if (currentSession.data.session) {
            const expiresAt = currentSession.data.session.expires_at;
            const now = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
            
            // Refresh if session expires in less than 10 minutes (more aggressive for mobile)
            if (timeUntilExpiry < 600) {
              console.log('Refreshing session proactively for mobile...');
              await supabase.auth.refreshSession();
            }
          }
        }, 30000); // Check every 30 seconds for mobile

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
