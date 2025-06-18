
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { UserPlus, ArrowLeft } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import MerchantLogo from '@/components/ui/merchant-logo';

const formSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  phone: z.string().min(10, { message: "Le numéro de téléphone doit contenir au moins 10 chiffres." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
});

const MerchantCustomerSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/connexion-commercant');
      }
    };
    checkUser();
  }, [navigate]);

  const { data: merchant } = useQuery({
    queryKey: ['merchantDetails', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!merchant) return;

    setIsLoading(true);
    try {
      // Vérifier si l'email existe déjà dans les profils
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', values.email)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn("Erreur lors de la vérification des profils:", profileError);
      }

      if (existingProfile) {
        toast({
          title: "Erreur",
          description: "Un compte avec cette adresse email existe déjà.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: Math.random().toString(36).slice(-8), // Mot de passe temporaire
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Créer le lien client-commerçant
        const { error: linkError } = await supabase
          .from('customer_merchant_link')
          .insert({
            customer_id: authData.user.id,
            merchant_id: merchant.id,
            loyalty_points: 0,
          });

        if (linkError) {
          throw linkError;
        }

        toast({
          title: "Succès !",
          description: `Client ${values.firstName} ${values.lastName} inscrit avec succès. Un email de confirmation a été envoyé.`,
        });

        form.reset();
      }
    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!user || !merchant) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  const themeColor = merchant.theme_color || "#6366f1";

  return (
    <>
      <Helmet>
        <title>Inscrire un client - {merchant.name}</title>
      </Helmet>
      <div className="min-h-screen bg-[#f8f9fb] p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/tableau-de-bord-commercant')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </div>

          <Card className="rounded-2xl shadow-lg border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <MerchantLogo 
                  logoUrl={merchant.logo_url} 
                  merchantName={merchant.name} 
                  size="lg"
                />
                <div>
                  <CardTitle className="text-2xl" style={{ color: themeColor }}>
                    Inscrire un nouveau client
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Commerce : {merchant.name}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder="Prénom du client" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom du client" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="0123456789" type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse email</FormLabel>
                        <FormControl>
                          <Input placeholder="client@email.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                      disabled={isLoading}
                    >
                      Réinitialiser
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      style={{ backgroundColor: themeColor }}
                      className="text-white hover:opacity-90"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {isLoading ? "Inscription en cours..." : "Inscrire le client"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MerchantCustomerSignup;
