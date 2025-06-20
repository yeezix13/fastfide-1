
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
  const [isUpdating, setIsUpdating] = useState(false);
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

      if (!token || !emailParam) {
        toast({
          title: "Lien invalide",
          description: "Le lien de réinitialisation est invalide.",
          variant: "destructive",
        });
        navigate('/customer');
        return;
      }

      try {
        // Décoder le token pour vérifier sa validité
        const decodedToken = atob(token);
        const [tokenEmail, timestamp] = decodedToken.split(':');
        
        // Vérifier que l'email correspond
        if (tokenEmail !== emailParam) {
          throw new Error('Token invalide');
        }
        
        // Vérifier que le token n'est pas expiré (1 heure)
        const tokenTime = parseInt(timestamp);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        if (now - tokenTime > oneHour) {
          throw new Error('Token expiré');
        }

        setEmail(emailParam);
        setIsValidToken(true);
      } catch (error) {
        toast({
          title: "Lien invalide ou expiré",
          description: "Le lien de réinitialisation est invalide ou a expiré.",
          variant: "destructive",
        });
        navigate('/customer');
        return;
      }
      
      setIsLoading(false);
    };

    validateToken();
  }, [searchParams, navigate, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsUpdating(true);
    
    try {
      // Utiliser l'API Admin de Supabase pour mettre à jour le mot de passe
      // En production, ceci devrait être fait via une Edge Function sécurisée
      
      // Pour l'instant, on va essayer de se connecter temporairement avec l'ancien mot de passe
      // puis mettre à jour. En production, il faudrait une Edge Function dédiée.
      
      // Créer une session temporaire pour cet utilisateur
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        throw new Error('Impossible de vérifier l\'utilisateur');
      }
      
      const user = users.users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Utiliser l'API admin pour mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: values.password }
      );

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Succès",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });
      
      // Rediriger vers la page de connexion appropriée
      setTimeout(() => {
        navigate('/customer');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le mot de passe. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
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
                disabled={isUpdating}
              >
                {isUpdating ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordCustomPage;
