
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useState } from "react";
import { generateSignupCode } from "@/utils/signupCodeGenerator";
import { merchantFormSchema } from "@/utils/formValidation";
import { useCustomSignup } from "@/hooks/useCustomSignup";
import PersonalInfoFields from "./form-fields/PersonalInfoFields";
import ContactInfoFields from "./form-fields/ContactInfoFields";
import BusinessInfoFields from "./form-fields/BusinessInfoFields";
import PasswordFields from "./form-fields/PasswordFields";
import ConsentCheckboxes from "./form-fields/ConsentCheckboxes";
import AntiSpamField from "./form-fields/AntiSpamField";

interface MerchantSignUpFormProps {
  onBackToLogin?: () => void;
}

const MerchantSignUpForm = ({ onBackToLogin }: MerchantSignUpFormProps) => {
  const { signUp, isLoading } = useCustomSignup();

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
      antiSpam: "",
    },
  });

  async function onSubmit(values: any) {
    try {
      console.log("=== Début du processus d'inscription commerçant ===");
      
      // Générer le code d'inscription automatiquement
      const signupCode = generateSignupCode(values.businessName);
      console.log("Code d'inscription généré:", signupCode);

      const success = await signUp({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        userType: 'merchant',
        businessName: values.businessName,
        address: values.address,
        rgpdConsent: values.rgpd_consent,
        dataUsageCommitment: values.data_usage_commitment,
      });

      if (success) {
        form.reset();
      }
    } catch (error) {
      console.error("Erreur inattendue lors de l'inscription:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PersonalInfoFields form={form} />
        <ContactInfoFields form={form} />
        <PasswordFields form={form} showConfirmPassword />
        <BusinessInfoFields form={form} />
        <AntiSpamField form={form} />
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
