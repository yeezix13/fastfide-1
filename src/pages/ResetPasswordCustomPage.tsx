
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

const ResetPasswordCustomPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get('token');
      const emailParam = searchParams.get('email');

      console.log('Token and email from URL:', { token, emailParam });

      if (!token || !emailParam) {
        console.log('Missing token or email');
        toast({
          title: "Lien invalide",
          description: "Le lien de réinitialisation est invalide.",
          variant: "destructive",
        });
        navigate('/customer');
        return;
      }

      try {
        // Décoder le token (qui est en base64)
        const decodedToken = atob(token);
        console.log('Decoded token:', decodedToken);
        
        // Le token contient email:timestamp
        const [tokenEmail, timestamp] = decodedToken.split(':');
        
        // Vérifier que l'email correspond
        if (tokenEmail !== emailParam) {
          console.log('Email mismatch');
          toast({
            title: "Lien invalide",
            description: "Le lien de réinitialisation est invalide.",
            variant: "destructive",
          });
          navigate('/customer');
          return;
        }

        // Vérifier que le token n'est pas expiré (24h)
        const tokenTime = parseInt(timestamp);
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (now - tokenTime > twentyFourHours) {
          console.log('Token expired');
          toast({
            title: "Lien expiré",
            description: "Ce lien de réinitialisation a expiré. Veuillez en demander un nouveau.",
            variant: "destructive",
          });
          navigate('/customer');
          return;
        }

        setEmail(emailParam);
        setIsValidToken(true);
        console.log('Token validation successful');
      } catch (error) {
        console.error('Error validating token:', error);
        toast({
          title: "Lien invalide",
          description: "Le lien de réinitialisation est invalide.",
          variant: "destructive",
        });
        navigate('/customer');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [searchParams, navigate, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      console.log('Calling admin password update for email:', email);
      
      // Appeler la fonction edge pour mettre à jour le mot de passe via l'API admin
      const { data, error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          type: 'admin_password_update',
          email: email,
          newPassword: values.password,
        },
      });

      if (error) {
        console.error('Error from edge function:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le mot de passe. " + error.message,
          variant: "destructive",
        });
      } else if (data?.error) {
        console.error('Error from admin update:', data.error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le mot de passe: " + data.error,
          variant: "destructive",
        });
      } else {
        console.log('Password update successful');
        toast({
          title: "Succès",
          description: "Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.",
        });
        
        // Rediriger vers la page de connexion
        navigate('/customer');
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Chargement...</div>
      </div>
    );
  }

  if (!isValidToken) {
    return null;
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
          <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
          <p className="text-sm text-gray-600">
            Créez un nouveau mot de passe pour {email}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField 
                control={form.control} 
                name="password" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Minimum 8 caractères"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              
              <FormField 
                control={form.control} 
                name="confirmPassword" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Répétez le mot de passe"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordCustomPage;
