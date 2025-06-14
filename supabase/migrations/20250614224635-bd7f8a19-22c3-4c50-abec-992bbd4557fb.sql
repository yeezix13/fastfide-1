
-- Création d'une table pour enregistrer les utilisations de récompenses (par client et commerçant)
CREATE TABLE public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  merchant_id uuid NOT NULL,
  reward_id uuid NOT NULL,
  points_spent integer NOT NULL,
  redeemed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES profiles(id),
  CONSTRAINT fk_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id),
  CONSTRAINT fk_reward FOREIGN KEY (reward_id) REFERENCES rewards(id)
);

-- Activer la sécurité par ligne
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Politique: chaque client peut voir ses propres redemptions
CREATE POLICY "Clients can view their own reward redemptions"
  ON public.reward_redemptions
  FOR SELECT
  USING (auth.uid() = customer_id);

-- Politique: seules les fonctions serveur peuvent insérer/redempter (gérée via API côté serveur pour éviter la fraude)
-- Vous pourrez affiner cela plus tard selon usage métier.
