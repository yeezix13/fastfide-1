
-- Créer un bucket pour stocker les logos des commerçants
INSERT INTO storage.buckets (id, name, public)
VALUES ('merchant-logos', 'merchant-logos', true);

-- Créer des politiques pour le bucket merchant-logos
CREATE POLICY "Anyone can view merchant logos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'merchant-logos');

CREATE POLICY "Merchants can upload their own logos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'merchant-logos' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Merchants can update their own logos" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'merchant-logos' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Merchants can delete their own logos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'merchant-logos' AND 
  auth.role() = 'authenticated'
);

-- Ajouter une colonne logo_url à la table merchants
ALTER TABLE public.merchants 
ADD COLUMN logo_url TEXT;
