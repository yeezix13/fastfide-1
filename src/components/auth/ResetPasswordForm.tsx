
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const formSchema = z.object({
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

const ResetPasswordForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      console.log('Tentative de mise à jour du mot de passe...');
      
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le mot de passe. " + error.message,
          variant: "destructive",
        });
      } else {
        console.log('Mot de passe mis à jour avec succès');
        toast({
          title: "Succès",
          description: "Votre mot de passe a été mis à jour avec succès.",
        });
        
        // Vérifier si l'utilisateur est un commerçant ou un client pour rediriger correctement
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: merchant } = await supabase
            .from('merchants')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (merchant) {
            navigate("/tableau-de-bord-commercant");
          } else {
            navigate("/tableau-de-bord-client");
          }
        } else {
          navigate("/connexion-client");
        }
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Nouveau mot de passe</h2>
        <p className="text-sm text-gray-600 mt-2">
          Choisissez un nouveau mot de passe sécurisé
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField 
            control={form.control} 
            name="password" 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nouveau mot de passe</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Minimum 6 caractères"
                    {...field} 
                  />
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
                  <Input 
                    type="password" 
                    placeholder="Répétez le mot de passe"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} 
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ResetPasswordForm;
