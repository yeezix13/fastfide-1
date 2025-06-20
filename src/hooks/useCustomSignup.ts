
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthEmail } from './useAuthEmail';

interface CustomerSignupData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  birthDate?: string;
  rgpdConsent: boolean;
  marketingConsent: boolean;
}

interface MerchantSignupData {
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  email: string;
  rgpdConsent: boolean;
  marketingConsent: boolean;
}

export const useCustomSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sendConfirmationEmail } = useAuthEmail();

  const signupCustomer = async (values: CustomerSignupData) => {
    setIsLoading(true);
    console.log("=== Début inscription client avec système personnalisé ===");

    try {
      // Vérifier si l'email existe déjà
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', values.email)
        .maybeSingle();

      if (existingProfile) {
        toast({
          title: "Erreur",
          description: "Un compte avec cette adresse email existe déjà.",
          variant: "destructive",
        });
        return false;
      }

      // Générer un mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm-email`,
          data: {
            user_type: 'customer',
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
            email: values.email,
            birth_date: values.birthDate,
            rgpd_consent: values.rgpdConsent,
            marketing_consent: values.marketingConsent,
            rgpd_consent_date: values.rgpdConsent ? new Date().toISOString() : null,
            marketing_consent_date: values.marketingConsent ? new Date().toISOString() : null,
          }
        }
      });

      if (authError) {
        console.error('Erreur lors de la création du compte:', authError);
        toast({
          title: "Erreur",
          description: "Impossible de créer le compte. Veuillez réessayer.",
          variant: "destructive",
        });
        return false;
      }

      if (authData.user) {
        // Envoyer l'email de confirmation via notre système personnalisé
        const emailSent = await sendConfirmationEmail({
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          userType: 'customer',
          userId: authData.user.id,
        });

        if (emailSent) {
          toast({
            title: "Inscription réussie !",
            description: "Un email de confirmation a été envoyé. Vérifiez votre boîte de réception.",
          });
          return true;
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  const signupMerchant = async (values: MerchantSignupData) => {
    setIsLoading(true);
    console.log("=== Début inscription commerçant avec système personnalisé ===");

    try {
      // Vérifier si l'email existe déjà
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', values.email)
        .maybeSingle();

      if (existingProfile) {
        toast({
          title: "Erreur",
          description: "Un compte avec cette adresse email existe déjà.",
          variant: "destructive",
        });
        return false;
      }

      // Générer un mot de passe temporaire
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm-email`,
          data: {
            user_type: 'merchant',
            first_name: values.firstName,
            last_name: values.lastName,
            business_name: values.businessName,
            phone: values.phone,
            email: values.email,
            rgpd_consent: values.rgpdConsent,
            marketing_consent: values.marketingConsent,
            rgpd_consent_date: values.rgpdConsent ? new Date().toISOString() : null,
            marketing_consent_date: values.marketingConsent ? new Date().toISOString() : null,
          }
        }
      });

      if (authError) {
        console.error('Erreur lors de la création du compte:', authError);
        toast({
          title: "Erreur",
          description: "Impossible de créer le compte. Veuillez réessayer.",
          variant: "destructive",
        });
        return false;
      }

      if (authData.user) {
        // Envoyer l'email de confirmation via notre système personnalisé
        const emailSent = await sendConfirmationEmail({
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          businessName: values.businessName,
          userType: 'merchant',
          userId: authData.user.id,
        });

        if (emailSent) {
          toast({
            title: "Inscription réussie !",
            description: "Un email de confirmation a été envoyé. Vérifiez votre boîte de réception.",
          });
          return true;
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  return {
    signupCustomer,
    signupMerchant,
    isLoading
  };
};
