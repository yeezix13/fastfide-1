
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';
import { useDeviceType } from '@/hooks/useDeviceType';

const formSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  phone: z.string().min(10, { message: "Le numéro de téléphone doit contenir au moins 10 chiffres." }),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
});

interface CustomerSignupFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  isLoading: boolean;
  themeColor: string;
}

const CustomerSignupForm = ({ onSubmit, isLoading, themeColor }: CustomerSignupFormProps) => {
  const { isMobile } = useDeviceType();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Prénom du client" {...field} />
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
                  <Input placeholder="Nom du client" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro de téléphone</FormLabel>
              <FormControl>
                <Input placeholder="0123456789" type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse email</FormLabel>
              <FormControl>
                <Input placeholder="client@email.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-end space-x-2'} pt-4`}>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading}
            className={isMobile ? 'w-full' : ''}
          >
            Réinitialiser
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            style={{ backgroundColor: themeColor }}
            className={`text-white hover:opacity-90 ${isMobile ? 'w-full' : ''}`}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {isLoading ? "Inscription en cours..." : "Inscrire le client"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CustomerSignupForm;
