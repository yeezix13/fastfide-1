
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomerSignupData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface Merchant {
  id: string;
  name: string;
}

export const useCustomerSignup = (merchant: Merchant | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const signupCustomer = async (values: CustomerSignupData) => {
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

        return true;
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
  };

  return {
    signupCustomer,
    isLoading
  };
};
