
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface ContactInfoFieldsProps {
  form: UseFormReturn<any>;
  showMerchantCode?: boolean;
  showPhone?: boolean;
}

const ContactInfoFields = ({ form, showMerchantCode = false, showPhone = true }: ContactInfoFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {showPhone && (
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="0123456789 (optionnel)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {showMerchantCode && (
        <FormField
          control={form.control}
          name="merchantCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code commerçant (optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="Saisissez le code de votre commerçant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default ContactInfoFields;
