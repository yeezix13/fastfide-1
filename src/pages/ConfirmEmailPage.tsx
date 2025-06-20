
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConfirmEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      const userType = searchParams.get('type');

      if (!token || !email || !userType) {
        setStatus('error');
        setMessage('Lien de confirmation invalide.');
        return;
      }

      try {
        console.log('Confirming email:', { email, userType, token });

        // Ici, vous pouvez ajouter votre logique de validation du token
        // Pour l'instant, nous utilisons la confirmation Supabase standard
        const { error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'signup'
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          setMessage('Erreur lors de la confirmation. Le lien a peut-être expiré.');
          
          toast({
            title: "Erreur de confirmation",
            description: "Le lien de confirmation est invalide ou a expiré.",
            variant: "destructive",
          });
        } else {
          setStatus('success');
          setMessage('Votre email a été confirmé avec succès !');
          
          toast({
            title: "Email confirmé",
            description: "Votre compte est maintenant activé. Vous pouvez vous connecter.",
          });

          // Rediriger après 3 secondes
          setTimeout(() => {
            if (userType === 'merchant') {
              navigate('/merchant');
            } else {
              navigate('/customer');
            }
          }, 3000);
        }
      } catch (error: any) {
        console.error('Unexpected error:', error);
        setStatus('error');
        setMessage('Une erreur inattendue est survenue.');
      }
    };

    confirmEmail();
  }, [searchParams, navigate, toast]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Confirmation en cours...';
      case 'success':
        return 'Email confirmé !';
      case 'error':
        return 'Erreur de confirmation';
    }
  };

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
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">{message}</p>
          
          {status === 'success' && (
            <p className="text-sm text-gray-500">
              Redirection automatique dans quelques secondes...
            </p>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/merchant')}
                variant="outline"
                className="w-full"
              >
                Retour à la connexion commerçant
              </Button>
              <Button 
                onClick={() => navigate('/customer')}
                variant="outline"
                className="w-full"
              >
                Retour à la connexion client
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmailPage;
