
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CustomerDuplicateHandler from "./CustomerDuplicateHandler";
import { createCustomerFormSchema } from "@/utils/formValidation";
import { checkDuplicates } from "@/utils/duplicateChecker";
import PersonalInfoFields from "./form-fields/PersonalInfoFields";
import ContactInfoFields from "./form-fields/ContactInfoFields";
import PasswordFields from "./form-fields/PasswordFields";
import ConsentCheckboxes from "./form-fields/ConsentCheckboxes";
import AntiSpamField from "./form-fields/AntiSpamField";

type Props = {
  merchantId?: string;
};

const CustomerSignUpForm = ({ merchantId }: Props) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formLoading, setFormLoading] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    email?: boolean;
    phone?: boolean;
    emailValue?: string;
  } | null>(null);

  const formSchema = createCustomerFormSchema(!!merchantId);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      birth_date: "",
      rgpd_consent: false,
      marketing_consent: false,
      antiSpam: "",
      ...(merchantId ? {} : { merchantCode: "" }),
    } as any,
  });

  async function onSubmit(values: any) {
    setFormLoading(true);
    setDuplicateInfo(null);

    try {
      console.log("=== Début du processus d'inscription client ===");
      console.log("Données du formulaire:", {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        rgpdConsent: values.rgpd_consent,
        marketingConsent: values.marketing_consent,
        merchantId: merchantId
      });

      // Vérifier les doublons avant de procéder
      const duplicates = await checkDuplicates(values.email, values.phone);
      
      if (duplicates.emailError || duplicates.phoneError) {
        console.error("Erreur lors de la vérification des doublons:", duplicates);
        toast({
          title: "Erreur",
          description: "Erreur lors de la vérification des données existantes.",
          variant: "destructive",
        });
        setFormLoading(false);
        return;
      }

      if (duplicates.emailExists || duplicates.phoneExists) {
        console.log("Doublon détecté:", duplicates);
        setDuplicateInfo({
          email: duplicates.emailExists,
          phone: duplicates.phoneExists,
          emailValue: values.email
        });
        setFormLoading(false);
        return;
      }

      // Trouver le commerçant à associer
      let merchant: { id: string } | null = null;
      if (merchantId) {
        merchant = { id: merchantId };
        console.log("Utilisation du merchantId fourni:", merchantId);
      } else {
        const { data, error } = await supabase
          .from("merchants")
          .select("id")
          .eq("signup_code", values.merchantCode)
          .maybeSingle();
        if (error || !data) {
          console.error("Code commerçant invalide:", error);
          toast({
            title: "Erreur",
            description: "Code commerçant invalide ou introuvable.",
            variant: "destructive",
          });
          setFormLoading(false);
          return;
        }
        merchant = { id: data.id };
        console.log("Commerçant trouvé via code:", data.id);
      }

      // Convertir la date de JJ/MM/AAAA vers YYYY-MM-DD
      let formattedBirthDate = null;
      if (values.birth_date && values.birth_date.trim() !== '') {
        const [day, month, year] = values.birth_date.split('/');
        formattedBirthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        console.log("Date de naissance formatée:", formattedBirthDate);
      }

      const currentDate = new Date().toISOString();
      console.log("Date actuelle pour les consentements:", currentDate);

      // Préparer les métadonnées pour l'inscription avec user_type
      const userMetadata = {
        user_type: 'customer',
        first_name: values.firstName,
        last_name: values.lastName,
        phone: values.phone,
        email: values.email,
        birth_date: formattedBirthDate,
        rgpd_consent: values.rgpd_consent,
        marketing_consent: values.marketing_consent || false,
        rgpd_consent_date: values.rgpd_consent ? currentDate : null,
        marketing_consent_date: values.marketing_consent ? currentDate : null,
        merchant_id: merchant.id, // Stocker l'ID du merchant pour l'associer après confirmation
      };

      console.log("Métadonnées utilisateur pour inscription:", userMetadata);

      // Nouvelle inscription avec toutes les métadonnées nécessaires
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: userMetadata,
          emailRedirectTo: `${window.location.origin}/customer-dashboard`,
        },
      });

      if (signUpError) {
        console.error("Erreur d'inscription Supabase:", signUpError);
        toast({
          title: "Erreur d'inscription",
          description: signUpError.message,
          variant: "destructive",
        });
        setFormLoading(false);
        return;
      }

      console.log("Inscription Supabase réussie:", {
        userId: authData.user?.id,
        hasSession: !!authData.session,
        emailConfirmed: authData.user?.email_confirmed_at
      });

      // L'utilisateur doit toujours confirmer son email
      if (authData.user && !authData.session) {
        console.log("Utilisateur créé, email de confirmation envoyé");
        toast({
          title: "Inscription réussie !",
          description: "Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation avant de pouvoir vous connecter.",
        });
        setFormLoading(false);
        return;
      }

      // Ce cas ne devrait pas arriver si la confirmation email est activée
      if (authData.user && authData.session) {
        console.log("Utilisateur connecté automatiquement, création du lien commerçant");
        // Associer au commerçant immédiatement
        const { error: linkError } = await supabase
          .from('customer_merchant_link')
          .insert({ customer_id: authData.user.id, merchant_id: merchant.id });

        if (linkError) {
          console.error("Erreur d'association au commerçant:", linkError);
          toast({
            title: "Erreur lors de l'association",
            description: "Nous n'avons pas pu vous associer au commerçant. Veuillez réessayer plus tard.",
            variant: "destructive",
          });
          setFormLoading(false);
          return;
        }
        
        console.log("Association au commerçant réussie");
        toast({
          title: "Bienvenue !",
          description: "Votre compte a été créé avec succès.",
        });
        setFormLoading(false);
        navigate("/customer-dashboard");
      }
    } catch (error) {
      console.error("Erreur inattendue lors de l'inscription:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  }

  // Si on a détecté des doublons, afficher le gestionnaire de doublons
  if (duplicateInfo) {
    return (
      <CustomerDuplicateHandler 
        duplicateInfo={duplicateInfo}
        onBack={() => setDuplicateInfo(null)}
      />
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <PersonalInfoFields form={form} showBirthDate />
        <ContactInfoFields form={form} showMerchantCode={!merchantId} />
        <PasswordFields form={form} />
        <AntiSpamField form={form} />
        <ConsentCheckboxes form={form} type="customer" />

        <Button type="submit" className="w-full" disabled={formLoading}>
          {formLoading ? "Chargement..." : "Je m'inscris"}
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

export default CustomerSignUpForm;
