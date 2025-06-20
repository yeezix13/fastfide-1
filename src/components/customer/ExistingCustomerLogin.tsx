
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});

interface ExistingCustomerLoginProps {
  merchantCode: string;
  merchantName: string;
  themeColor: string;
}

const ExistingCustomerLogin = ({ merchantCode, merchantName, themeColor }: ExistingCustomerLoginProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      // Connexion de l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect.",
          variant: "destructive",
        });
        return;
      }

      if (authData.user) {
        // Vérifier si l'utilisateur est déjà lié au commerçant
        const { data: merchant } = await supabase
          .from('merchants')
          .select('id')
          .eq('signup_code', merchantCode)
          .single();

        if (merchant) {
          const { data: existingLink } = await supabase
            .from('customer_merchant_link')
            .select('id')
            .eq('customer_id', authData.user.id)
            .eq('merchant_id', merchant.id)
            .maybeSingle();

          if (!existingLink) {
            // Créer le lien client-commerçant
            const { error: linkError } = await supabase
              .from('customer_merchant_link')
              .insert({
                customer_id: authData.user.id,
                merchant_id: merchant.id,
                loyalty_points: 0,
              });

            if (linkError) {
              console.error("Erreur lors de la création du lien:", linkError);
              toast({
                title: "Erreur",
                description: "Impossible de vous associer au commerçant.",
                variant: "destructive",
              });
              return;
            }

            toast({
              title: "✅ Connexion réussie !",
              description: `Vous êtes maintenant associé au programme de fidélité de ${merchantName}.`,
            });
          } else {
            toast({
              title: "✅ Connexion réussie !",
              description: `Vous êtes déjà membre du programme de fidélité de ${merchantName}.`,
            });
          }

          // Rediriger vers le tableau de bord client
          window.location.href = '/customer-dashboard';
        }
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center" style={{ color: themeColor }}>
          J'ai déjà un compte FastFide
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Connectez-vous pour rejoindre <strong>{merchantName}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="votre@email.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
              style={{ backgroundColor: themeColor }}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? "Connexion..." : "Se connecter et rejoindre"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ExistingCustomerLogin;
