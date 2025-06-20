
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from './useErrorHandler';

interface CustomerSignupData {
  email: string;
}

interface Merchant {
  id: string;
  name: string;
  signup_code?: string;
}

export const useCustomerSignupByMerchant = (merchant: Merchant | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  const signupCustomer = async (values: CustomerSignupData) => {
    if (!merchant) {
      handleError("Aucun commerçant sélectionné", "CustomerSignupByMerchant");
      return false;
    }

    setIsLoading(true);
    console.log("=== Début ajout client par commerçant ===");
    console.log("Email:", values.email);
    console.log("Commerçant:", merchant);

    try {
      // Vérifier si l'email existe déjà dans les profils
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('email', values.email)
        .maybeSingle();

      if (profileError) {
        console.error("Erreur lors de la vérification du profil:", profileError);
        handleError(profileError, "CustomerSignupByMerchant - Profile check");
        return false;
      }

      if (existingProfile) {
        // Le client existe déjà, vérifier s'il est déjà lié à ce commerçant
        console.log("Client existant trouvé:", existingProfile);
        
        const { data: existingLink, error: linkError } = await supabase
          .from('customer_merchant_link')
          .select('id')
          .eq('customer_id', existingProfile.id)
          .eq('merchant_id', merchant.id)
          .maybeSingle();

        if (linkError && linkError.code !== 'PGRST116') {
          console.error("Erreur lors de la vérification du lien:", linkError);
          handleError(linkError, "CustomerSignupByMerchant - Link check");
          return false;
        }

        if (existingLink) {
          toast({
            title: "Client déjà inscrit",
            description: `${existingProfile.first_name} ${existingProfile.last_name} est déjà dans votre base de clients.`,
            variant: "destructive",
          });
          return false;
        }

        // Créer le lien client-commerçant
        const { error: newLinkError } = await supabase
          .from('customer_merchant_link')
          .insert({
            customer_id: existingProfile.id,
            merchant_id: merchant.id,
            loyalty_points: 0,
          });

        if (newLinkError) {
          console.error("Erreur création lien:", newLinkError);
          handleError(newLinkError, "CustomerSignupByMerchant - Link creation");
          return false;
        }

        toast({
          title: "✅ Inscription réussie !",
          description: `${existingProfile.first_name} ${existingProfile.last_name} a été ajouté avec succès à votre programme de fidélité.`,
        });

        console.log("Client existant ajouté avec succès");
        return true;
      } else {
        // Le client n'existe pas, envoyer un email d'invitation
        console.log("Client non trouvé, envoi d'une invitation");

        const signupUrl = merchant.signup_code 
          ? `https://app.fastfide.com/customer-signup?merchant=${merchant.signup_code}`
          : `https://app.fastfide.com/customer-signup`;

        console.log("URL d'inscription générée:", signupUrl);

        // Envoyer l'email d'invitation via notre edge function
        const { error: emailError } = await supabase.functions.invoke('send-auth-email', {
          body: {
            type: 'customer_invitation',
            email: values.email,
            merchantName: merchant.name,
            signupUrl: signupUrl,
          },
        });

        if (emailError) {
          console.error('Erreur envoi email:', emailError);
          handleError(emailError, "CustomerSignupByMerchant - Email invitation");
          return false;
        }

        toast({
          title: "📧 Email d'invitation envoyé !",
          description: `Un lien d'inscription personnalisé a été envoyé à ${values.email} pour rejoindre votre programme de fidélité.`,
        });

        console.log("Email d'invitation envoyé avec succès");
        return true;
      }
    } catch (error: any) {
      handleError(error, "CustomerSignupByMerchant", {
        fallbackMessage: "Une erreur est survenue lors du traitement."
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
