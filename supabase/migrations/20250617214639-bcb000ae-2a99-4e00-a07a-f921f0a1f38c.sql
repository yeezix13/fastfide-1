
-- Supprimer la contrainte de clé primaire actuelle sur customer_merchant_link
-- qui limite un client à un seul commerçant
ALTER TABLE public.customer_merchant_link 
DROP CONSTRAINT IF EXISTS customer_merchant_link_pkey;

-- Ajouter une nouvelle clé primaire composite pour permettre 
-- plusieurs associations par client
ALTER TABLE public.customer_merchant_link 
ADD CONSTRAINT customer_merchant_link_pkey 
PRIMARY KEY (customer_id, merchant_id);

-- Ajouter une contrainte unique pour éviter les doublons
ALTER TABLE public.customer_merchant_link 
ADD CONSTRAINT unique_customer_merchant 
UNIQUE (customer_id, merchant_id);

-- Mettre à jour les politiques RLS pour s'assurer qu'elles fonctionnent 
-- avec la nouvelle structure
DROP POLICY IF EXISTS "Customers can see their own loyalty accounts." ON public.customer_merchant_link;
DROP POLICY IF EXISTS "Customers can create their loyalty account link." ON public.customer_merchant_link;
DROP POLICY IF EXISTS "Merchants can manage their customers' loyalty accounts." ON public.customer_merchant_link;

-- Recréer les politiques RLS
CREATE POLICY "Customers can see their own loyalty accounts." 
ON public.customer_merchant_link 
FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create their loyalty account link." 
ON public.customer_merchant_link 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Merchants can manage their customers' loyalty accounts." 
ON public.customer_merchant_link 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.merchants m
    WHERE m.id = customer_merchant_link.merchant_id AND m.user_id = auth.uid()
  )
);
