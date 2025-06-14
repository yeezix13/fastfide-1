
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "Le prénom est requis." }),
  lastName: z.string().min(1, { message: "Le nom est requis." }),
  phone: z.string().min(1, { message: "Le numéro de téléphone est requis." }),
  email: z.string().email({ message: "Veuillez saisir une adresse e-mail valide." }),
  merchantCode: z.string().min(1, { message: "Le code commerçant est requis." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});

const CustomerSignUpForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      merchantCode: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("id")
      .eq("signup_code", values.merchantCode)
      .single();

    if (merchantError || !merchant) {
      toast({
        title: "Erreur",
        description: "Code commerçant invalide ou introuvable.",
        variant: "destructive",
      });
      return;
    }

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone,
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
      return;
    }

    if (authData.user && !authData.session) {
      toast({
        title: "Inscription réussie !",
        description: "Veuillez vérifier votre boîte de réception pour confirmer votre adresse e-mail.",
      });
      return;
    }

    if (authData.user && authData.session) {
       const { error: linkError } = await supabase
        .from('customer_merchant_link')
        .insert({ customer_id: authData.user.id, merchant_id: merchant.id });
      
      if (linkError) {
        toast({
          title: "Erreur lors de l'association",
          description: "Nous n'avons pas pu vous associer au commerçant. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Bienvenue !",
        description: "Votre compte a été créé avec succès.",
      });
      navigate("/tableau-de-bord-client");
    }
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
          <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="merchantCode" render={({ field }) => (
          <FormItem><FormLabel>Code commerçant *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem><FormLabel>Mot de passe</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" className="w-full">Je m'inscris</Button>
      </form>
    </Form>
  );
};

export default CustomerSignUpForm;
