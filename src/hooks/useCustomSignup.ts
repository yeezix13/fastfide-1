
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthEmail } from './useAuthEmail';
import { useErrorHandler } from './useErrorHandler';

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  userType: 'customer' | 'merchant';
  businessName?: string;
  birthDate?: string | null;
  rgpdConsent: boolean;
  marketingConsent?: boolean;
  merchantCode?: string;
}

export const useCustomSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sendConfirmationEmail } = useAuthEmail();
  const { handleError } = useErrorHandler();

  const signUp = async (userData: SignUpData) => {
    setIsLoading(true);
    console.log("=== Début inscription ===");
    console.log("Type d'utilisateur:", userData.userType);
    console.log("Email:", userData.email);

    try {
      // Créer l'utilisateur avec confirmation d'email désactivée
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          // Désactiver la confirmation d'email automatique de Supabase
          emailRedirectTo: undefined,
          data: {
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            user_type: userData.userType,
            business_name: userData.businessName,
            birth_date: userData.birthDate,
            rgpd_consent: userData.rgpdConsent,
            marketing_consent: userData.marketingConsent || false,
            rgpd_consent_date: userData.rgpdConsent ? new Date().toISOString() : null,
            marketing_consent_date: userData.marketingConsent ? new Date().toISOString() : null,
          },
        },
      });

      if (error) {
        console.error("Erreur lors de l'inscription:", error);
        handleError(error, "CustomSignup");
        return false;
      }

      console.log("Utilisateur créé:", data.user?.id);

      // Envoyer l'email de confirmation via Resend seulement
      const emailSent = await sendConfirmationEmail({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        businessName: userData.businessName,
        userType: userData.userType,
        userId: data.user?.id || '',
      });

      if (!emailSent) {
        console.error("Échec de l'envoi de l'email de confirmation");
        return false;
      }

      // Gérer l'association avec le commerçant si un code est fourni
      if (userData.merchantCode && userData.userType === 'customer') {
        console.log("Code commerçant fourni:", userData.merchantCode);
        
        // Trouver le commerçant par son code
        const { data: merchant, error: merchantError } = await supabase
          .from('merchants')
          .select('id')
          .eq('signup_code', userData.merchantCode)
          .single();

        if (merchantError) {
          console.error("Erreur lors de la recherche du commerçant:", merchantError);
        } else if (merchant && data.user) {
          // Créer le lien client-commerçant
          const { error: linkError } = await supabase
            .from('customer_merchant_link')
            .insert({
              customer_id: data.user.id,
              merchant_id: merchant.id,
              loyalty_points: 0,
            });

          if (linkError) {
            console.error("Erreur lors de la création du lien client-commerçant:", linkError);
          } else {
            console.log("Lien client-commerçant créé avec succès");
          }
        }
      }

      return true;
    } catch (error: any) {
      console.error("Erreur générale lors de l'inscription:", error);
      handleError(error, "CustomSignup", {
        fallbackMessage: "Une erreur inattendue s'est produite lors de l'inscription."
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signUp,
    isLoading,
  };
};
