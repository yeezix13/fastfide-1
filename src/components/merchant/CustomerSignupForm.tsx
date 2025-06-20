
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { useEffect } from 'react';

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
});

interface CustomerSignupFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  isLoading: boolean;
  themeColor: string;
}

const CustomerSignupForm = ({ onSubmit, isLoading, themeColor }: CustomerSignupFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
    // Réinitialiser le formulaire après soumission réussie
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse email du client *</FormLabel>
              <FormControl>
                <Input placeholder="client@email.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Réinitialiser
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            style={{ backgroundColor: themeColor }}
            className="text-white hover:opacity-90"
          >
            <Mail className="mr-2 h-4 w-4" />
            {isLoading ? "Traitement en cours..." : "Ajouter le client"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CustomerSignupForm;
