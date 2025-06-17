
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isValidSession, setIsValidSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Vérifier s'il y a des paramètres de reset dans l'URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        console.log('Reset password page params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });

        if (accessToken && refreshToken && type === 'recovery') {
          // Restaurer la session avec les tokens de l'URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Erreur lors de la restauration de session:', error);
            navigate('/connexion-client');
            return;
          }

          console.log('Session restaurée avec succès:', data);
          setIsValidSession(true);
        } else {
          // Vérifier la session existante
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error || !session) {
            console.log('Aucune session valide trouvée, redirection vers connexion');
            navigate('/connexion-client');
            return;
          }
          
          setIsValidSession(true);
        }
      } catch (error) {
        console.error('Erreur lors de la gestion du reset password:', error);
        navigate('/connexion-client');
      } finally {
        setIsLoading(false);
      }
    };

    handlePasswordReset();
  }, [navigate, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  if (!isValidSession) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Réinitialisation du mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
