
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CustomerDuplicateHandler from "./CustomerDuplicateHandler";

// Fonction pour valider le format JJ/MM/AAAA
const validateDateFormat = (dateString: string): boolean => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(regex);
  
  if (!match) return false;
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  // Vérifier que les valeurs sont dans des plages valides
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;
  
  // Vérifier que la date existe réellement
  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
};

const baseSchema = {
  firstName: z.string().min(1, { message: "Le prénom est requis." }),
  lastName: z.string().min(1, { message: "Le nom est requis." }),
  phone: z.string().min(1, { message: "Le numéro de téléphone est requis." }),
  email: z.string().email({ message: "Veuillez saisir une adresse e-mail valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  birth_date: z.string().optional().refine((val) => {
    if (!val || val === '') return true; // Champ optionnel
    return validateDateFormat(val);
  }, { message: "Format de date invalide. Utilisez JJ/MM/AAAA (ex: 15/03/1990)" }),
  rgpd_consent: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter le consentement RGPD pour créer votre compte."
  }),
  marketing_consent: z.boolean().optional(),
};

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

  // Si merchantId est fourni, le code commerçant n'est pas demandé
  const formSchema = z.object({
    ...baseSchema,
    ...(merchantId ? {} : {
      merchantCode: z.string().min(1, { message: "Le code commerçant est requis." }),
    }),
  });

  // React hook form
  const form = useForm<z.infer<typeof formSchema>>({
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
      ...(merchantId ? {} : { merchantCode: "" }),
    } as any,
  });

  // Fonction pour vérifier les doublons
  const checkDuplicates = async (email: string, phone: string) => {
    const [emailCheck, phoneCheck] = await Promise.all([
      supabase.from("profiles").select("id").eq("email", email).maybeSingle(),
      supabase.from("profiles").select("id").eq("phone", phone).maybeSingle()
    ]);

    return {
      emailExists: !!emailCheck.data,
      phoneExists: !!phoneCheck.data,
      emailError: emailCheck.error,
      phoneError: phoneCheck.error
    };
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setFormLoading(true);
    setDuplicateInfo(null);

    try {
      // Vérifier les doublons avant de procéder
      const duplicates = await checkDuplicates(values.email, values.phone);
      
      if (duplicates.emailError || duplicates.phoneError) {
        toast({
          title: "Erreur",
          description: "Erreur lors de la vérification des données existantes.",
          variant: "destructive",
        });
        setFormLoading(false);
        return;
      }

      if (duplicates.emailExists || duplicates.phoneExists) {
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
      } else {
        const { data, error } = await supabase
          .from("merchants")
          .select("id")
          .eq("signup_code", values.merchantCode)
          .maybeSingle();
        if (error || !data) {
          toast({
            title: "Erreur",
            description: "Code commerçant invalide ou introuvable.",
            variant: "destructive",
          });
          setFormLoading(false);
          return;
        }
        merchant = { id: data.id };
      }

      // Convertir la date de JJ/MM/AAAA vers YYYY-MM-DD
      let formattedBirthDate = null;
      if (values.birth_date && values.birth_date.trim() !== '') {
        const [day, month, year] = values.birth_date.split('/');
        formattedBirthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      // Nouvelle inscription avec email obligatoire
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phone,
            email: values.email,
            birth_date: formattedBirthDate,
            rgpd_consent: values.rgpd_consent,
            marketing_consent: values.marketing_consent || false,
            rgpd_consent_date: values.rgpd_consent ? new Date().toISOString() : null,
            marketing_consent_date: values.marketing_consent ? new Date().toISOString() : null,
          },
          emailRedirectTo: `${window.location.origin}/customer-dashboard`,
        },
      });

      if (signUpError) {
        toast({
          title: "Erreur d'inscription",
          description: signUpError.message,
          variant: "destructive",
        });
        setFormLoading(false);
        return;
      }

      if (authData.user && !authData.session) {
        toast({
          title: "Inscription réussie !",
          description: "Veuillez vérifier votre boîte de réception pour confirmer votre adresse e-mail.",
        });
        setFormLoading(false);
        return;
      }

      if (authData.user && authData.session) {
        // Associer au commerçant immédiatement
        const { error: linkError } = await supabase
          .from('customer_merchant_link')
          .insert({ customer_id: authData.user.id, merchant_id: merchant.id });

        if (linkError) {
          toast({
            title: "Erreur lors de l'association",
            description: "Nous n'avons pas pu vous associer au commerçant. Veuillez réessayer plus tard.",
            variant: "destructive",
          });
          setFormLoading(false);
          return;
        }
        toast({
          title: "Bienvenue !",
          description: "Votre compte a été créé avec succès.",
        });
        setFormLoading(false);
        navigate("/customer-dashboard");
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
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
        <FormField control={form.control} name="firstName" render={({ field }) => (
          <FormItem><FormLabel>Prénom *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="lastName" render={({ field }) => (
          <FormItem><FormLabel>Nom *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem><FormLabel>N° de téléphone *</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem><FormLabel>Email *</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField
          control={form.control}
          name="birth_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de naissance</FormLabel>
              <FormControl>
                <Input 
                  placeholder="JJ/MM/AAAA (ex: 15/03/1990)" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!merchantId && (
          <FormField control={form.control} name="merchantCode" render={({ field }) => (
            <FormItem><FormLabel>Code commerçant *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem><FormLabel>Mot de passe</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        
        {/* Cases à cocher RGPD */}
        <div className="space-y-3 border-t pt-4">
          <FormField
            control={form.control}
            name="rgpd_consent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    J'accepte que mes données soient utilisées pour créer mon compte fidélité et bénéficier des services Fastfide. *
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="marketing_consent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    J'accepte de recevoir des communications commerciales par email et SMS de la part du commerçant chez qui je m'inscris.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

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
