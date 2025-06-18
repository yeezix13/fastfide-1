
-- Ajouter les champs de consentement RGPD dans la table profiles (pour les clients)
ALTER TABLE public.profiles 
ADD COLUMN rgpd_consent BOOLEAN DEFAULT false,
ADD COLUMN marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN rgpd_consent_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN marketing_consent_date TIMESTAMP WITH TIME ZONE;

-- Ajouter les champs de consentement RGPD dans la table merchants (pour les commerçants)
ALTER TABLE public.merchants 
ADD COLUMN rgpd_consent BOOLEAN DEFAULT false,
ADD COLUMN data_usage_commitment BOOLEAN DEFAULT false,
ADD COLUMN rgpd_consent_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN data_usage_commitment_date TIMESTAMP WITH TIME ZONE;
