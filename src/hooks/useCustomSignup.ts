import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'customer' | 'merchant';
  businessName?: string;
  address?: string;
  birthDate?: string;
  rgpdConsent: boolean;
  marketingConsent?: boolean;
  dataUsageCommitment?: boolean;
  merchantCode?: string;
}

export const useCustomSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const signUp = async (data: SignupData) => {
    setIsLoading(true);
    
    try {
      console.log('=== Début inscription personnalisée ===');
      console.log('Type:', data.userType, 'Email:', data.email);

      // Créer le compte utilisateur avec confirmation désactivée
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          // Ne pas rediriger automatiquement
          emailRedirectTo: undefined,
          data: {
            user_type: data.userType,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            email: data.email,
            ...(data.businessName && { business_name: data.businessName }),
            ...(data.address && { address: data.address }),
            ...(data.birthDate && { birth_date: data.birthDate }),
            rgpd_consent: data.rgpdConsent,
            ...(data.marketingConsent !== undefined && { marketing_consent: data.marketingConsent }),
            ...(data.dataUsageCommitment !== undefined && { data_usage_commitment: data.dataUsageCommitment }),
            ...(data.merchantCode && { merchant_code: data.merchantCode }),
          }
        }
      });

      if (signUpError) {
        console.error('Erreur création utilisateur:', signUpError);
        
        if (signUpError.message.includes('already exists') || 
            signUpError.message.includes('User already registered') || 
            signUpError.code === 'user_already_exists') {
          toast({
            title: "Email déjà utilisé",
            description: `L'adresse email ${data.email} est déjà associée à un compte.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur d'inscription",
            description: signUpError.message,
            variant: "destructive",
          });
        }
        return false;
      }

      if (authData.user) {
        console.log('Utilisateur créé:', authData.user.id);
        
        // Envoyer l'email de confirmation personnalisé via notre fonction edge
        const { error: emailError } = await supabase.functions.invoke('send-auth-email', {
          body: {
            type: 'signup_confirmation',
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            businessName: data.businessName,
            userType: data.userType,
            userId: authData.user.id, // Ajouter l'userId pour générer un token plus court
          },
        });

        if (emailError) {
          console.error('Erreur envoi email:', emailError);
          toast({
            title: "Inscription réussie mais...",
            description: "Votre compte a été créé mais l'email de confirmation n'a pas pu être envoyé. Contactez le support.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Inscription réussie !",
            description: "Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation.",
          });
        }
        
        return true;
      }
    } catch (error: any) {
      console.error('Erreur inattendue:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  return { signUp, isLoading };
};
