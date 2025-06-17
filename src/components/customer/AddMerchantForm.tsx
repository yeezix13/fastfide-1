
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  merchantCode: z.string().min(1, { message: "Le code commerçant est requis." }),
});

interface AddMerchantFormProps {
  userId: string;
}

const AddMerchantForm = ({ userId }: AddMerchantFormProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      merchantCode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Vérifier si le code commerçant existe
      const { data: merchant, error: merchantError } = await supabase
        .from("merchants")
        .select("id, name")
        .eq("signup_code", values.merchantCode)
        .maybeSingle();

      if (merchantError || !merchant) {
        toast({
          title: "Erreur",
          description: "Code commerçant invalide ou introuvable.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Vérifier si l'association existe déjà
      const { data: existingLink, error: linkCheckError } = await supabase
        .from("customer_merchant_link")
        .select("customer_id")
        .eq("customer_id", userId)
        .eq("merchant_id", merchant.id)
        .maybeSingle();

      if (linkCheckError && linkCheckError.code !== 'PGRST116') {
        toast({
          title: "Erreur",
          description: "Erreur lors de la vérification de l'association.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (existingLink) {
        toast({
          title: "Information",
          description: "Vous êtes déjà inscrit chez ce commerçant.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Créer l'association
      const { error: insertError } = await supabase
        .from("customer_merchant_link")
        .insert({
          customer_id: userId,
          merchant_id: merchant.id,
          loyalty_points: 0,
        });

      if (insertError) {
        toast({
          title: "Erreur",
          description: "Impossible de vous inscrire chez ce commerçant.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Succès !",
        description: `Vous êtes maintenant inscrit chez ${merchant.name}.`,
      });

      // Actualiser les données
      queryClient.invalidateQueries({ queryKey: ['loyaltyAccounts'] });
      
      // Fermer le dialog et réinitialiser le formulaire
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error("Erreur lors de l'ajout du commerçant:", error);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un commerçant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau commerçant</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="merchantCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code commerçant</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez le code du commerçant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Ajout en cours..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMerchantForm;
