
import * as z from "zod";

// Fonction pour valider la réponse anti-spam
const validateAntiSpam = (value: string) => {
  // Cette validation sera côté client, la vraie validation sera côté serveur
  return value && value.length > 0;
};

export const merchantFormSchema = z.object({
  email: z.string().email({ message: "Veuillez saisir une adresse e-mail valide." }),
  password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." }),
  confirmPassword: z.string(),
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  businessName: z.string().min(2, { message: "Le nom du commerce doit contenir au moins 2 caractères." }),
  address: z.string().min(5, { message: "L'adresse doit contenir au moins 5 caractères." }),
  phone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, { 
    message: "Veuillez saisir un numéro de téléphone français valide." 
  }),
  rgpd_consent: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter la politique de confidentialité."
  }),
  data_usage_commitment: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter l'engagement d'utilisation des données."
  }),
  antiSpam: z.string().min(1, { message: "Veuillez répondre à la question anti-spam." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

export const createCustomerFormSchema = (hasMerchantId: boolean) => {
  const baseSchema = z.object({
    firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
    lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
    email: z.string().email({ message: "Veuillez saisir une adresse e-mail valide." }),
    password: z.string().min(8, { message: "Le mot de passe doit contenir au moins 8 caractères." }),
    phone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/, { 
      message: "Veuillez saisir un numéro de téléphone français valide." 
    }),
    rgpd_consent: z.boolean().refine(val => val === true, {
      message: "Vous devez accepter la politique de confidentialité."
    }),
    marketing_consent: z.boolean().optional(),
    antiSpam: z.string().min(1, { message: "Veuillez répondre à la question anti-spam." }),
  });

  if (hasMerchantId) {
    // Pour les inscriptions par merchant : date de naissance optionnelle
    return baseSchema.extend({
      birth_date: z.string().optional(),
    });
  }

  // Pour les inscriptions depuis /customer : code commerçant optionnel
  return baseSchema.extend({
    merchantCode: z.string().optional(),
  });
};
