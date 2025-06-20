
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { generateSignupCode } from "@/utils/signupCodeGenerator";
import { merchantFormSchema } from "@/utils/formValidation";
import PersonalInfoFields from "./form-fields/PersonalInfoFields";
import ContactInfoFields from "./form-fields/ContactInfoFields";
import BusinessInfoFields from "./form-fields/BusinessInfoFields";
import PasswordFields from "./form-fields/PasswordFields";
import ConsentCheckboxes from "./form-fields/ConsentCheckboxes";

const MerchantSignUpForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(merchantFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      businessName: "",
      address: "",
      phone: "",
      rgpd_consent: false,
      data_usage_commitment: false,
    },
  });

  async function onSubmit(values: any) {
    setIsLoading(true);
    
    try {
      console.log("=== Début du processus d'inscription commerçant ===");
      console.log("Données du formulaire:", {
        email: values.email,
        businessName: values.businessName,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        rgpdConsent: values.rgpd_consent,
        dataUsageCommitment: values.data_usage_commitment
      });
      
      // Générer le code d'inscription automatiquement
      const signupCode = generateSignupCode(values.businessName);
      console.log("Code d'inscription généré:", signupCode);

      // Vérifier que le code d'inscription est unique
      const { data: existingMerchant } = await supabase
        .from('merchants')
        .select('signup_code')
        .eq('signup_code', signupCode)
        .maybeSingle();

      if (existingMerchant) {
        console.log("Code d'inscription déjà existant:", signupCode);
        toast({
          title: "Erreur",
          description: "Un commerce avec un nom similaire existe déjà. Veuillez modifier le nom de votre commerce.",
          variant: "destructive",
        });
        return;
      }

      const currentDate = new Date().toISOString();
      console.log("Date actuelle pour les consentements:", currentDate);

      // Préparer les métadonnées pour l'inscription avec user_type
      const userMetadata = {
        user_type: 'merchant',
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
        rgpd_consent: values.rgpd_consent,
        data_usage_commitment: values.data_usage_commitment,
        rgpd_consent_date: values.rgpd_consent ? currentDate : null,
        data_usage_commitment_date: values.data_usage_commitment ? currentDate : null,
      };

      console.log("Métadonnées utilisateur pour inscription:", userMetadata);

      // Créer le compte utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/merchant`,
          data: userMetadata
        }
      });

      console.log("Résultat inscription:", { authData, authError });

      if (authError) {
        console.error("Erreur d'inscription Supabase:", authError);
        
        if (authError.message.includes('already registered') || 
            authError.message.includes('User already registered') || 
            authError.code === 'user_already_exists') {
          toast({
            title: "Email déjà utilisé",
            description: `L'adresse email ${values.email} est déjà associée à un compte. Veuillez utiliser une autre adresse email ou vous connecter si c'est votre compte.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur d'inscription",
            description: `Erreur: ${authError.message}`,
            variant: "destructive",
          });
        }
        return;
      }

      if (authData.user) {
        console.log("Utilisateur créé avec succès:", {
          userId: authData.user.id,
          email: authData.user.email
        });
        
        // Attendre un peu pour que le trigger handle_new_user se termine
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Créer l'entrée commerçant
        const merchantData = {
          user_id: authData.user.id,
          name: values.businessName,
          signup_code: signupCode,
          address: values.address,
          phone: values.phone,
          contact_email: values.email,
          points_per_euro: 1.0,
          rgpd_consent: values.rgpd_consent,
          data_usage_commitment: values.data_usage_commitment,
          rgpd_consent_date: values.rgpd_consent ? currentDate : null,
          data_usage_commitment_date: values.data_usage_commitment ? currentDate : null,
        };

        console.log("Création du profil commerçant:", merchantData);

        const { error: merchantError } = await supabase
          .from('merchants')
          .insert(merchantData);

        if (merchantError) {
          console.error("Erreur lors de la création du profil commerçant:", merchantError);
          toast({
            title: "Erreur",
            description: "Erreur lors de la création du profil commerçant. Veuillez réessayer.",
            variant: "destructive",
          });
          return;
        }

        console.log("Profil commerçant créé avec succès");
        toast({
          title: "Inscription réussie !",
          description: `Un email de validation a été envoyé à votre adresse. Votre code d'inscription généré est : ${signupCode}`,
        });
        
        form.reset();
      }
    } catch (error) {
      console.error("Erreur inattendue lors de l'inscription:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PersonalInfoFields form={form} />
        <ContactInfoFields form={form} />
        <PasswordFields form={form} showConfirmPassword />
        <BusinessInfoFields form={form} />
        <ConsentCheckboxes form={form} type="merchant" />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Création en cours..." : "Créer mon compte commerçant"}
        </Button>

        {/* Texte légal */}
        <p className="text-xs text-gray-500 text-center">
          En créant un compte, vous acceptez notre{" "}
          <a 
            href="https://www.fastfide.com/politique-de-confidentialite/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline hover:text-gray-700"
          >
            Politique de confidentialité
          </a>{" "}
          et nos{" "}
          <a 
            href="https://www.fastfide.com/cgu/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline hover:text-gray-700"
          >
            Conditions générales d'utilisation
          </a>.
        </p>
      </form>
    </Form>
  );
};

export default MerchantSignUpForm;
