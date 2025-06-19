
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import type { User } from '@supabase/supabase-js';

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

const profileFormSchema = z.object({
  first_name: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
  last_name: z.string().min(2, { message: "Le nom de famille doit contenir au moins 2 caractères." }),
  phone: z.string().optional(),
  email: z.string().email({ message: "Veuillez saisir une adresse e-mail valide." }),
  birth_date: z.string().optional().refine((val) => {
    if (!val || val === '') return true; // Champ optionnel
    return validateDateFormat(val);
  }, { message: "Format de date invalide. Utilisez JJ/MM/AAAA (ex: 15/03/1990)" }),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface CustomerPreferencesFormProps {
  profile: any;
  user: User | null;
  onSubmit: (data: ProfileFormValues) => void;
  isLoading: boolean;
}

const CustomerPreferencesForm = ({ profile, user, onSubmit, isLoading }: CustomerPreferencesFormProps) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      birth_date: '',
    },
  });

  useEffect(() => {
    if (profile && user) {
      // Convertir la date de format YYYY-MM-DD vers JJ/MM/AAAA
      let formattedBirthDate = '';
      if (profile.birth_date) {
        const date = new Date(`${profile.birth_date}T00:00:00`);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        formattedBirthDate = `${day}/${month}/${year}`;
      }

      form.reset({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        email: user.email || '',
        birth_date: formattedBirthDate,
      });
    }
  }, [profile, user, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prénom</FormLabel>
              <FormControl>
                <Input placeholder="Votre prénom" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Votre nom" {...field} />
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
                <Input placeholder="Votre numéro de téléphone" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Votre email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Mise à jour en cours...' : 'Mettre à jour'}
        </Button>
      </form>
    </Form>
  );
};

export default CustomerPreferencesForm;
