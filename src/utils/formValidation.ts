
import * as z from 'zod';

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

export const merchantFormSchema = z.object({
  email: z.string().email({ message: "Veuillez saisir une adresse e-mail valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  confirmPassword: z.string(),
  firstName: z.string().min(1, { message: "Le prénom est requis." }),
  lastName: z.string().min(1, { message: "Le nom est requis." }),
  businessName: z.string().min(1, { message: "Le nom du commerce est requis." }),
  address: z.string().min(1, { message: "L'adresse est requise." }),
  phone: z.string().min(1, { message: "Le téléphone est requis." }),
  rgpd_consent: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter le consentement RGPD pour créer votre compte."
  }),
  data_usage_commitment: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter l'engagement sur l'usage des données clients."
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

export const createCustomerFormSchema = (hasMerchantId: boolean) => z.object({
  firstName: z.string().min(1, { message: "Le prénom est requis." }),
  lastName: z.string().min(1, { message: "Le nom est requis." }),
  phone: z.string().min(1, { message: "Le numéro de téléphone est requis." }),
  email: z.string().email({ message: "Veuillez saisir une adresse e-mail valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  birth_date: z.string().optional().refine((val) => {
    if (!val || val === '') return true; // Champ optionnel
    return validateDateFormat(val);
  }, { message: "Format de date invalide. Utilisez JJ/MM/AAAA (ex: 15/03/1990)" }),
  rgpd_consent: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter le consentement RGPD pour créer votre compte."
  }),
  marketing_consent: z.boolean().optional(),
  ...(hasMerchantId ? {} : {
    merchantCode: z.string().min(1, { message: "Le code commerçant est requis." }),
  }),
});
