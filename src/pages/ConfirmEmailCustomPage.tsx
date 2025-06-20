
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const ConfirmEmailCustomPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const confirmUser = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      console.log('Confirmation avec token et email:', { token, email });

      if (!token || !email) {
        console.log('Token ou email manquant');
        toast({
          title: "Lien invalide",
          description: "Le lien de confirmation est invalide.",
          variant: "destructive",
        });
        navigate('/customer');
        return;
      }

      try {
        // Décoder le token pour extraire les informations
        const decodedToken = atob(token);
        const [userIdPrefix, randomString, timestamp] = decodedToken.split(':');
        
        console.log('Token décodé:', { userIdPrefix, randomString, timestamp });

        // Vérifier que le token n'est pas expiré (24h)
        const tokenTime = parseInt(timestamp);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (now - tokenTime > twentyFourHours) {
          console.log('Token expiré');
          toast({
            title: "Lien expiré",
            description: "Ce lien de confirmation a expiré. Veuillez vous inscrire à nouveau.",
            variant: "destructive",
          });
          navigate('/customer');
          return;
        }

        // Utiliser notre fonction edge pour confirmer l'utilisateur via l'API admin
        const { data, error } = await supabase.functions.invoke('send-auth-email', {
          body: {
            type: 'confirm_email',
            token: token,
            email: email
          },
        });

        if (error) {
          console.error('Erreur confirmation:', error);
          toast({
            title: "Erreur",
            description: "Impossible de confirmer votre email. Veuillez réessayer.",
            variant: "destructive",
          });
        } else if (data?.success) {
          console.log('Email confirmé avec succès');
          setIsConfirmed(true);
          toast({
            title: "Email confirmé !",
            description: "Votre adresse email a été confirmée avec succès. Vous pouvez maintenant vous connecter.",
          });
        } else {
          console.log('Confirmation échouée:', data);
          toast({
            title: "Erreur",
            description: data?.error || "La confirmation a échoué.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erreur lors de la confirmation:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la confirmation.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    confirmUser();
  }, [searchParams, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Confirmation en cours...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col items-center mb-6">
        <img 
          src="/lovable-uploads/9c24c620-d700-43f2-bb91-b498726fd2ff.png" 
          alt="FastFide" 
          className="h-24 w-auto mb-2"
        />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isConfirmed ? "Email confirmé !" : "Confirmation échouée"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {isConfirmed ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Votre adresse email a été confirmée avec succès. Vous pouvez maintenant vous connecter à votre compte.
              </p>
              <Button 
                onClick={() => navigate('/customer')}
                className="w-full"
              >
                Se connecter
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                La confirmation de votre email a échoué. Le lien peut être expiré ou invalide.
              </p>
              <Button 
                onClick={() => navigate('/customer')}
                variant="outline"
                className="w-full"
              >
                Retour à l'accueil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmailCustomPage;
