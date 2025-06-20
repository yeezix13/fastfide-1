
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useState } from "react";
import CustomerDuplicateHandler from "./CustomerDuplicateHandler";
import { createCustomerFormSchema } from "@/utils/formValidation";
import { checkDuplicates } from "@/utils/duplicateChecker";
import { useCustomSignup } from "@/hooks/useCustomSignup";
import PersonalInfoFields from "./form-fields/PersonalInfoFields";
import ContactInfoFields from "./form-fields/ContactInfoFields";
import PasswordFields from "./form-fields/PasswordFields";
import ConsentCheckboxes from "./form-fields/ConsentCheckboxes";
import AntiSpamField from "./form-fields/AntiSpamField";

interface CustomerSignUpFormProps {
  merchantId?: string;
  onBackToLogin?: () => void;
}

const CustomerSignUpForm = ({ merchantId, onBackToLogin }: CustomerSignUpFormProps) => {
  const [duplicateInfo, setDuplicateInfo] = useState<{
    email?: boolean;
    phone?: boolean;
    emailValue?: string;
  } | null>(null);

  const { signUp, isLoading } = useCustomSignup();
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
    setDuplicateInfo(null);

    try {
      console.log("=== Vérification des doublons ===");
      
      // Vérifier les doublons avant de procéder
      const duplicates = await checkDuplicates(values.email, values.phone);
      
      if (duplicates.emailError || duplicates.phoneError) {
        console.error("Erreur lors de la vérification des doublons:", duplicates);
        return;
      }

      if (duplicates.emailExists || duplicates.phoneExists) {
        console.log("Doublon détecté:", duplicates);
        setDuplicateInfo({
          email: duplicates.emailExists,
          phone: duplicates.phoneExists,
          emailValue: values.email
        });
        return;
      }

      // Convertir la date de JJ/MM/AAAA vers YYYY-MM-DD
      let formattedBirthDate = null;
      if (values.birth_date && values.birth_date.trim() !== '') {
        const [day, month, year] = values.birth_date.split('/');
        formattedBirthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      const success = await signUp({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        userType: 'customer',
        birthDate: formattedBirthDate,
        rgpdConsent: values.rgpd_consent,
        marketingConsent: values.marketing_consent || false,
        merchantCode: merchantId ? undefined : values.merchantCode,
      });

      if (success) {
        form.reset();
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Chargement..." : "Je m'inscris"}
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
