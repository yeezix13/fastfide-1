
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CustomerDuplicateHandler from "./CustomerDuplicateHandler";

const baseSchema = {
  firstName: z.string().min(1, { message: "Le prénom est requis." }),
  lastName: z.string().min(1, { message: "Le nom est requis." }),
  phone: z.string().min(1, { message: "Le numéro de téléphone est requis." }),
  email: z.string().email({ message: "Veuillez saisir une adresse e-mail valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  birth_date: z.date({ coerce: true }).optional(),
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
      birth_date: undefined,
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
            birth_date: values.birth_date ? format(values.birth_date, 'yyyy-MM-dd') : null,
          },
          emailRedirectTo: `${window.location.origin}/tableau-de-bord-client`,
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
        navigate("/tableau-de-bord-client");
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
            <FormItem className="flex flex-col">
              <FormLabel>Date de naissance</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: fr })
                      ) : (
                        <span>Choisissez une date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    locale={fr}
                    captionLayout="dropdown-buttons"
                    fromYear={1930}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
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
        <Button type="submit" className="w-full" disabled={formLoading}>
          {formLoading ? "Chargement..." : "Je m'inscris"}
        </Button>
      </form>
    </Form>
  );
};

export default CustomerSignUpForm;
