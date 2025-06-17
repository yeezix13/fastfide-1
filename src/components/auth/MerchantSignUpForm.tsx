
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
  signupCode: z.string().min(3, { message: "Le code d'inscription doit contenir au moins 3 caractères." }),
  address: z.string().optional(),
  phone: z.string().optional(),
  pointsPerEuro: z.string().default("1"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

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
      signupCode: "",
      address: "",
      phone: "",
      pointsPerEuro: "1",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      // Vérifier que le code d'inscription est unique
      const { data: existingMerchant } = await supabase
        .from('merchants')
        .select('signup_code')
        .eq('signup_code', values.signupCode)
        .single();

      if (existingMerchant) {
        toast({
          title: "Erreur",
          description: "Ce code d'inscription est déjà utilisé. Veuillez en choisir un autre.",
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
        if (authError.message.includes('already registered')) {
          toast({
            title: "Erreur",
            description: "Cette adresse e-mail est déjà utilisée.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erreur d'inscription",
            description: authError.message,
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        // Créer l'entrée commerçant
        const { error: merchantError } = await supabase
          .from('merchants')
          .insert({
            user_id: authData.user.id,
            name: values.businessName,
            signup_code: values.signupCode,
            address: values.address || null,
            phone: values.phone || null,
            contact_email: values.email,
            points_per_euro: parseFloat(values.pointsPerEuro),
          });

        if (merchantError) {
          toast({
            title: "Erreur",
            description: "Erreur lors de la création du profil commerçant.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        toast({
          title: "Inscription réussie !",
          description: "Un email de validation a été envoyé à votre adresse. Veuillez cliquer sur le lien pour activer votre compte.",
        });
        
        form.reset();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
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
          name="signupCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code d'inscription</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="ex: BOULANGERIE2024"
                  className="uppercase"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
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
              <FormLabel>Adresse (optionnel)</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Téléphone (optionnel)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="0123456789" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pointsPerEuro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points par euro dépensé</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Création en cours..." : "Créer mon compte commerçant"}
        </Button>
      </form>
    </Form>
  );
};

export default MerchantSignUpForm;
