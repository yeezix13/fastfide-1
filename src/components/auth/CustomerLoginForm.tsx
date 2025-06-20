
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ForgotPasswordForm from "./ForgotPasswordForm";

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez saisir une adresse e-mail valide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});

const CustomerLoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      console.log('Tentative de connexion customer:', values.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      console.log('Résultat connexion:', { data, error });

      if (error) {
        console.error('Erreur de connexion:', error);
        
        // Vérifier si l'utilisateur n'a pas confirmé son email
        if (error.message.includes('Email not confirmed') || 
            error.message.includes('email_not_confirmed') ||
            error.message.includes('signup_disabled')) {
          toast({
            title: "Email non confirmé",
            description: "Veuillez confirmer votre adresse email en cliquant sur le lien dans l'email que nous vous avons envoyé.",
            variant: "destructive",
          });
        } else if (error.message.includes('Invalid login credentials') || 
                   error.message.includes('invalid_credentials')) {
          toast({
            title: "Erreur de connexion",
            description: "Identifiants incorrects. Vérifiez votre email et mot de passe.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur de connexion",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.user) {
        console.log('Utilisateur connecté:', data.user.id);
        
        // Vérifier si l'utilisateur est bien un customer
        const { data: customerData, error: customerError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('id', data.user.id)
          .single();

        if (customerError || !customerData) {
          console.error('Utilisateur non trouvé dans la table profiles:', customerError);
          toast({
            title: "Accès refusé",
            description: "Ce compte n'est pas associé à un profil client.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        console.log('Customer trouvé:', customerData);
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${customerData.first_name} ${customerData.last_name} !`,
        });
        
        navigate("/customer-dashboard");
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm 
        onBackToLogin={() => setShowForgotPassword(false)} 
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField 
          control={form.control} 
          name="email" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="votre@email.com"
                  {...field} 
                />
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
                <Input 
                  type="password" 
                  placeholder="Votre mot de passe"
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
          {isLoading ? "Connexion..." : "Se connecter"}
        </Button>
        
        <Button 
          type="button" 
          variant="ghost" 
          className="w-full" 
          onClick={() => setShowForgotPassword(true)}
        >
          Mot de passe oublié ?
        </Button>
      </form>
    </Form>
  );
};

export default CustomerLoginForm;
