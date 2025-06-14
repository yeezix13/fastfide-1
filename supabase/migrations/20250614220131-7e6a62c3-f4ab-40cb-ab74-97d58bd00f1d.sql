
-- Ajouter le champ email (obligatoire) au profil des clients (table profiles)
ALTER TABLE public.profiles
ADD COLUMN email TEXT NOT NULL DEFAULT '';

-- (optionnel) Ajouter un index pour recherche rapide sur l'email
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
