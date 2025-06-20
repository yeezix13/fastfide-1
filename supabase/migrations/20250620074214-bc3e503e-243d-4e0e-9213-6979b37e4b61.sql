
-- 1. CORRECTIONS DE COHÉRENCE SCHEMA/CODE
-- Ajouter les foreign keys manquantes et corriger les références

-- Ajouter foreign key pour customer_merchant_link.customer_id -> profiles.id
ALTER TABLE public.customer_merchant_link 
ADD CONSTRAINT fk_customer_profile 
FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ajouter foreign key pour visits.customer_id -> profiles.id  
ALTER TABLE public.visits 
ADD CONSTRAINT fk_visits_customer_profile 
FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ajouter foreign key pour reward_redemptions.customer_id -> profiles.id
ALTER TABLE public.reward_redemptions 
ADD CONSTRAINT fk_redemptions_customer_profile 
FOREIGN KEY (customer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. SÉCURITÉ RLS - Ajouter toutes les politiques manquantes

-- Politiques pour customer_merchant_link
CREATE POLICY "Merchants can view their customer links" 
  ON public.customer_merchant_link 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.merchants m 
      WHERE m.id = merchant_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view their merchant links" 
  ON public.customer_merchant_link 
  FOR SELECT 
  USING (customer_id = auth.uid());

CREATE POLICY "Merchants can insert customer links" 
  ON public.customer_merchant_link 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.merchants m 
      WHERE m.id = merchant_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can update their customer links" 
  ON public.customer_merchant_link 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.merchants m 
      WHERE m.id = merchant_id AND m.user_id = auth.uid()
    )
  );

-- Politiques pour profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Politiques pour rewards
CREATE POLICY "Merchants can manage their rewards" 
  ON public.rewards 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.merchants m 
      WHERE m.id = merchant_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view rewards from their merchants" 
  ON public.rewards 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.customer_merchant_link cml 
      WHERE cml.merchant_id = merchant_id AND cml.customer_id = auth.uid()
    )
  );

-- Politiques pour visits
CREATE POLICY "Merchants can view visits to their business" 
  ON public.visits 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.merchants m 
      WHERE m.id = merchant_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view their own visits" 
  ON public.visits 
  FOR SELECT 
  USING (customer_id = auth.uid());

CREATE POLICY "Merchants can insert visits" 
  ON public.visits 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.merchants m 
      WHERE m.id = merchant_id AND m.user_id = auth.uid()
    )
  );

-- Politiques pour reward_redemptions
CREATE POLICY "Merchants can view redemptions in their business" 
  ON public.reward_redemptions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.merchants m 
      WHERE m.id = merchant_id AND m.user_id = auth.uid()
    )
  );

-- 3. OPTIMISATIONS BASE DE DONNÉES - Index pour les performances
CREATE INDEX IF NOT EXISTS idx_customer_merchant_link_customer_id ON public.customer_merchant_link(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_merchant_link_merchant_id ON public.customer_merchant_link(merchant_id);
CREATE INDEX IF NOT EXISTS idx_visits_customer_merchant ON public.visits(customer_id, merchant_id);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON public.visits(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_merchants_signup_code ON public.merchants(signup_code);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_customer_merchant ON public.reward_redemptions(customer_id, merchant_id);
CREATE INDEX IF NOT EXISTS idx_rewards_merchant_points ON public.rewards(merchant_id, points_required);

-- Ajouter des contraintes de validation
ALTER TABLE public.merchants 
ADD CONSTRAINT check_points_per_euro_positive 
CHECK (points_per_euro > 0);

ALTER TABLE public.rewards 
ADD CONSTRAINT check_points_required_positive 
CHECK (points_required > 0);

ALTER TABLE public.visits 
ADD CONSTRAINT check_amount_spent_positive 
CHECK (amount_spent >= 0);

ALTER TABLE public.customer_merchant_link 
ADD CONSTRAINT check_loyalty_points_non_negative 
CHECK (loyalty_points >= 0);
