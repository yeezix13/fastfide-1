
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from './useErrorHandler';

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
  const { handleError } = useErrorHandler();

  const signupCustomer = async (values: CustomerSignupData) => {
    if (!merchant) {
      handleError("Aucun commerçant sélectionné", "CustomerSignup");
      return false;
    }

    setIsLoading(true);
    console.log("=== Début inscription client ===");
    console.log("Données:", values);
    console.log("Commerçant:", merchant);

    try {
      // Vérifier si l'email existe déjà
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', values.email)
        .maybeSingle();

      if (existingProfile) {
        console.log("Email déjà existant:", values.email);
        toast({
          title: "Erreur",
          description: "Un compte avec cette adresse email existe déjà.",
          variant: "destructive",
        });
        return false;
      }

      // Générer un mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-8);
      console.log("Mot de passe temporaire généré");

      // Créer le compte utilisateur avec user_type customer
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: tempPassword,
        options: {
          data: {
            user_type: 'customer',
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
            email: values.email,
          }
        }
      });

      console.log("Résultat inscription auth:", { authData, authError });

      if (authError) {
        handleError(authError, "CustomerSignup - Auth");
        return false;
      }

      if (authData.user) {
        console.log("Utilisateur créé avec ID:", authData.user.id);

        // Attendre le trigger handle_new_user
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Créer le lien client-commerçant
        const { error: linkError } = await supabase
          .from('customer_merchant_link')
          .insert({
            customer_id: authData.user.id,
            merchant_id: merchant.id,
            loyalty_points: 0,
          });

        if (linkError) {
          handleError(linkError, "CustomerSignup - Link creation");
          return false;
        }

        console.log("Lien client-commerçant créé avec succès");

        toast({
          title: "Succès !",
          description: `Client ${values.firstName} ${values.lastName} inscrit avec succès.`,
        });

        return true;
      }
    } catch (error: any) {
      handleError(error, "CustomerSignup", {
        fallbackMessage: "Une erreur est survenue lors de l'inscription."
      });
      return false;
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  return {
    signupCustomer,
    isLoading
  };
};
