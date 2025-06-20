import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import LogoUpload from './LogoUpload';
import { Separator } from '@/components/ui/separator';
import type { Database } from '@/integrations/supabase/types';

type Merchant = Database['public']['Tables']['merchants']['Row'];

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  address: z.string().optional(),
  phone: z.string().optional(),
  contact_email: z.string().email('Adresse e-mail invalide.').optional().or(z.literal('')),
  theme_color: z.string().min(4).max(20).regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Couleur hexadécimale invalide.').optional(),
});

interface MerchantProfileFormProps {
  merchant: Merchant;
}

const MerchantProfileForm = ({ merchant }: MerchantProfileFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: merchant.name || '',
      address: merchant.address || '',
      phone: merchant.phone || '',
      contact_email: merchant.contact_email || '',
      theme_color: merchant.theme_color || '#2563eb',
    },
  });

  const updateMerchantMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { error } = await supabase
        .from('merchants')
        .update({
          name: values.name,
          address: values.address,
          phone: values.phone,
          contact_email: values.contact_email,
          theme_color: values.theme_color,
        })
        .eq('id', merchant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Succès', description: 'Vos informations ont été mises à jour.' });
      queryClient.invalidateQueries({ queryKey: ['merchantDetails', merchant.user_id] });
    },
    onError: (error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateMerchantMutation.mutate(values);
  }

  return (
    <div className="space-y-6">
      <LogoUpload merchant={merchant} />
      
      <Separator />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du commerce</FormLabel>
                <FormControl><Input {...field} /></FormControl>
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
                <FormControl><Input {...field} /></FormControl>
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
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email de contact</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="theme_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Couleur du thème</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <input
                      {...field}
                      type="color"
                      className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                      value={field.value || "#2563eb"}
                      onChange={(e) => field.onChange(e.target.value)}
                      aria-label="Choisissez votre couleur"
                    />
                    <Input
                      value={field.value || "#2563eb"}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-28"
                      maxLength={20}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={updateMerchantMutation.isPending} className="w-full">
            {updateMerchantMutation.isPending ? 'Mise à jour...' : 'Enregistrer les modifications'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default MerchantProfileForm;
