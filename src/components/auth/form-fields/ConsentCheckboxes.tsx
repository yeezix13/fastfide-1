
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UseFormReturn } from 'react-hook-form';

interface ConsentCheckboxesProps {
  form: UseFormReturn<any>;
  type: 'merchant' | 'customer';
}

const ConsentCheckboxes = ({ form, type }: ConsentCheckboxesProps) => {
  return (
    <div className="space-y-3 border-t pt-4">
      <FormField
        control={form.control}
        name="rgpd_consent"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-sm font-normal">
                {type === 'merchant' 
                  ? "J'accepte que mes données soient utilisées pour la gestion de mon compte commerçant et de mon programme de fidélité. *"
                  : "J'accepte que mes données soient utilisées pour créer mon compte fidélité et bénéficier des services Fastfide. *"
                }
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name={type === 'merchant' ? 'data_usage_commitment' : 'marketing_consent'}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value || false}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-sm font-normal">
                {type === 'merchant' 
                  ? "Je m'engage à respecter la réglementation en vigueur (RGPD) concernant les données des clients collectées via Fastfide, notamment en ce qui concerne les communications par email ou SMS. *"
                  : "J'accepte de recevoir des communications commerciales par email et SMS de la part du commerçant chez qui je m'inscris."
                }
              </FormLabel>
              {type === 'merchant' && <FormMessage />}
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default ConsentCheckboxes;
