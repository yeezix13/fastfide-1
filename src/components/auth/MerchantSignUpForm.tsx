
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import PersonalInfoFields from "./form-fields/PersonalInfoFields";
import BusinessInfoFields from "./form-fields/BusinessInfoFields";
import ContactInfoFields from "./form-fields/ContactInfoFields";
import ConsentCheckboxes from "./form-fields/ConsentCheckboxes";
import AntiSpamField from "./form-fields/AntiSpamField";
import { useCustomSignup } from "@/hooks/useCustomSignup";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  businessName: z.string().min(2, { message: "Le nom de l'entreprise doit contenir au moins 2 caractères." }),
  phone: z.string().min(10, { message: "Le numéro de téléphone doit contenir au moins 10 chiffres." }),
  email: z.string().email({ message: "Veuillez saisir une adresse e-mail valide." }),
  rgpdConsent: z.boolean().refine(val => val === true, { message: "Vous devez accepter le traitement de vos données." }),
  marketingConsent: z.boolean(),
  antiSpam: z.string().length(0, { message: "Ce champ doit rester vide." }),
});

interface MerchantSignUpFormProps {
  onBackToLogin: () => void;
}

const MerchantSignUpForm = ({ onBackToLogin }: MerchantSignUpFormProps) => {
  const { signupMerchant, isLoading } = useCustomSignup();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      businessName: "",
      phone: "",
      email: "",
      rgpdConsent: false,
      marketingConsent: false,
      antiSpam: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const success = await signupMerchant({
      firstName: values.firstName,
      lastName: values.lastName,
      businessName: values.businessName,
      phone: values.phone,
      email: values.email,
      rgpdConsent: values.rgpdConsent,
      marketingConsent: values.marketingConsent,
    });

    if (success) {
      form.reset();
      // Optionnel : rediriger ou afficher un message de succès
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Inscription Commerçant</h2>
        <p className="text-sm text-gray-600 mt-2">
          Créez votre compte professionnel pour fidéliser vos clients
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <PersonalInfoFields form={form} />
          <BusinessInfoFields form={form} />
          <ContactInfoFields form={form} />
          <ConsentCheckboxes form={form} />
          <AntiSpamField form={form} />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full" 
            onClick={onBackToLogin}
          >
            Retour à la connexion
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default MerchantSignUpForm;
