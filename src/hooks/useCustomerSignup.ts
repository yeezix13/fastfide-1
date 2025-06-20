
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
    console.log("=== Début inscription client ===");
    console.log("Données:", values);
    console.log("Commerçant:", merchant);

    try {
      // Vérifier si l'email existe déjà dans les profils
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', values.email)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Erreur lors de la vérification des profils:", profileError);
      }

      if (existingProfile) {
        console.log("Email déjà existant:", values.email);
        toast({
          title: "Erreur",
          description: "Un compte avec cette adresse email existe déjà.",
          variant: "destructive",
        });
        return;
      }

      // Générer un mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-8);
      console.log("Mot de passe temporaire généré");

      // Créer le compte utilisateur avec les métadonnées
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: tempPassword,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
            email: values.email,
          }
        }
      });

      console.log("Résultat inscription auth:", { authData, authError });

      if (authError) {
        console.error("Erreur auth:", authError);
        throw authError;
      }

      if (authData.user) {
        console.log("Utilisateur créé avec ID:", authData.user.id);

        // Attendre un peu pour que le trigger handle_new_user se termine
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Créer le lien client-commerçant
        const { error: linkError } = await supabase
          .from('customer_merchant_link')
          .insert({
            customer_id: authData.user.id,
            merchant_id: merchant.id,
            loyalty_points: 0,
          });

        if (linkError) {
          console.error("Erreur création lien:", linkError);
          throw linkError;
        }

        console.log("Lien client-commerçant créé avec succès");

        toast({
          title: "Succès !",
          description: `Client ${values.firstName} ${values.lastName} inscrit avec succès.`,
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
