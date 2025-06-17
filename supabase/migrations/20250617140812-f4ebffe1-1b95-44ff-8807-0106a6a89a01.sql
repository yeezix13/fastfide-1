
-- Activer RLS sur la table merchants
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs d'insérer leurs propres données de commerçant
CREATE POLICY "Users can insert their own merchant data" 
  ON public.merchants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de voir leurs propres données de commerçant
CREATE POLICY "Users can view their own merchant data" 
  ON public.merchants 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier leurs propres données de commerçant
CREATE POLICY "Users can update their own merchant data" 
  ON public.merchants 
  FOR UPDATE 
  USING (auth.uid() = user_id);
