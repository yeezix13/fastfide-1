
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez saisir une adresse e-mail valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  confirmPassword: z.string(),
  firstName: z.string().min(1, { message: "Le prénom est requis." }),
  lastName: z.string().min(1, { message: "Le nom est requis." }),
  businessName: z.string().min(1, { message: "Le nom du commerce est requis." }),
  address: z.string().min(1, { message: "L'adresse est requise." }),
  phone: z.string().min(1, { message: "Le téléphone est requis." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

// Fonction pour générer le code d'inscription automatiquement
const generateSignupCode = (businessName: string): string => {
  return businessName
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9]/g, '')
    .toUpperCase();
};

const MerchantSignUpForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      businessName: "",
      address: "",
      phone: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      // Vérifier d'abord si l'email existe déjà dans la table auth
      console.log("Tentative d'inscription pour:", values.email);
      
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
        toast({
          title: "Erreur",
          description: "Un commerce avec un nom similaire existe déjà. Veuillez modifier le nom de votre commerce.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Créer le compte utilisateur avec validation par email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/connexion-commercant`,
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
          }
        }
      });

      if (authError) {
        console.error("Auth error:", authError);
        
        if (authError.message.includes('already registered') || authError.message.includes('User already registered') || authError.code === 'user_already_exists') {
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
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        console.log("Utilisateur créé avec succès:", authData.user.id);
        
        // Créer l'entrée commerçant
        const { error: merchantError } = await supabase
          .from('merchants')
          .insert({
            user_id: authData.user.id,
            name: values.businessName,
            signup_code: signupCode,
            address: values.address,
            phone: values.phone,
            contact_email: values.email,
            points_per_euro: 1.0,
          });

        if (merchantError) {
          console.error("Merchant creation error:", merchantError);
          toast({
            title: "Erreur",
            description: "Erreur lors de la création du profil commerçant. Veuillez réessayer.",
            variant: "destructive",
          });
          setIsLoading(false);
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
      console.error("Unexpected error:", error);
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du commerce</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input {...field} placeholder="12 rue de la paix, 75015 Paris" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="0123456789" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <!-- Texte de consentement RGPD avec liens -->
        <p class="text-xs text-gray-500">
          En créant un compte, vous acceptez notre
          <a href="/privacy" class="underline hover:text-gray-700">Politique de confidentialité</a>
          et nos
          <a href="/terms" class="underline hover:text-gray-700">Conditions générales d’utilisation</a>.
        </p>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Création en cours..." : "Créer mon compte commerçant"}
        </Button>
      </form>
    </Form>
  );
};

export default MerchantSignUpForm;
