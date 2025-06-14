
-- Autoriser le commerçant à voir les profils de ses clients
CREATE POLICY "Merchant can see linked customer profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.customer_merchant_link l
      JOIN public.merchants m ON m.id = l.merchant_id
      WHERE l.customer_id = profiles.id
      AND m.user_id = auth.uid()
    )
  );
