
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";

interface AntiSpamFieldProps {
  form: UseFormReturn<any>;
}

const AntiSpamField = ({ form }: AntiSpamFieldProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    // Générer une question mathématique simple
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const result = num1 + num2;
    
    setQuestion(`Combien font ${num1} + ${num2} ?`);
    setAnswer(result.toString());
  }, []);

  return (
    <FormField
      control={form.control}
      name="antiSpam"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Vérification anti-spam: {question}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type="text"
              placeholder="Votre réponse"
              className="w-full"
              onChange={(e) => {
                field.onChange(e);
                // Valider automatiquement la réponse
                if (e.target.value === answer) {
                  form.clearErrors("antiSpam");
                } else if (e.target.value.length > 0) {
                  form.setError("antiSpam", { 
                    message: "Réponse incorrecte" 
                  });
                }
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AntiSpamField;
