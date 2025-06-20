
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface ContactInfoFieldsProps {
  form: UseFormReturn<any>;
  showMerchantCode?: boolean;
}

const ContactInfoFields = ({ form, showMerchantCode = false }: ContactInfoFieldsProps) => {
  return (
    <>
      {showMerchantCode && (
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>N° de téléphone *</FormLabel>
              <FormControl>
                <Input type="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email {showMerchantCode ? '*' : ''}</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {!showMerchantCode && (
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
      )}

      {showMerchantCode && (
        <FormField
          control={form.control}
          name="merchantCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code commerçant *</FormLabel>
              <FormControl>
                <Input {...field} />
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
