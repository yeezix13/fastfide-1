
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuthEmail } from "@/hooks/useAuthEmail";

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez saisir une adresse e-mail valide." }),
});

interface MerchantForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const MerchantForgotPasswordForm = ({ onBackToLogin }: MerchantForgotPasswordFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { sendResetPasswordEmail } = useAuthEmail();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      await sendResetPasswordEmail({
        email: values.email,
        userType: 'merchant'
      });
      
      form.reset();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Mot de passe oublié</h2>
        <p className="text-sm text-gray-600 mt-2">
          Saisissez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField 
            control={form.control} 
            name="email" 
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="votre@email.com"
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
            {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
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

export default MerchantForgotPasswordForm;
