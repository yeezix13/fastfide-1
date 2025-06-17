
-- Mise à jour de la fonction redeem_reward pour enregistrer correctement les rachats de récompenses
CREATE OR REPLACE FUNCTION public.redeem_reward(
  customer_phone_number TEXT,
  merchant_user_id UUID,
  reward_id_to_redeem UUID
)
RETURNS JSON AS $$
DECLARE
  target_customer_id UUID;
  target_merchant_id UUID;
  reward_points_required INT;
  customer_current_points INT;
  customer_profile JSON;
  reward_name TEXT;
BEGIN
  -- 1. Find merchant_id from user_id
  SELECT id INTO target_merchant_id
  FROM public.merchants
  WHERE user_id = merchant_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Commerçant non trouvé.');
  END IF;

  -- 2. Find customer_id from phone number
  SELECT id, json_build_object('first_name', first_name, 'last_name', last_name) INTO target_customer_id, customer_profile
  FROM public.profiles
  WHERE phone = customer_phone_number;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Client avec ce numéro de téléphone non trouvé.');
  END IF;

  -- 3. Get reward details
  SELECT points_required, name INTO reward_points_required, reward_name
  FROM public.rewards
  WHERE id = reward_id_to_redeem AND merchant_id = target_merchant_id;

  IF NOT FOUND THEN
      RETURN json_build_object('error', 'Récompense non trouvée pour ce commerçant.');
  END IF;

  -- 4. Get customer's current points for this merchant
  SELECT loyalty_points INTO customer_current_points
  FROM public.customer_merchant_link
  WHERE customer_id = target_customer_id AND merchant_id = target_merchant_id;

  IF NOT FOUND THEN
      RETURN json_build_object('error', 'Ce client n''est pas encore lié à votre commerce.');
  END IF;
  
  -- 5. Check if customer has enough points
  IF customer_current_points < reward_points_required THEN
    RETURN json_build_object('error', 'Points insuffisants pour utiliser cette récompense.');
  END IF;

  -- 6. Insert into reward_redemptions table
  INSERT INTO public.reward_redemptions (customer_id, merchant_id, reward_id, points_spent)
  VALUES (target_customer_id, target_merchant_id, reward_id_to_redeem, reward_points_required);

  -- 7. Insert into visits table to track the redemption
  INSERT INTO public.visits (customer_id, merchant_id, amount_spent, points_earned, points_spent)
  VALUES (target_customer_id, target_merchant_id, 0, 0, reward_points_required);

  -- 8. Deduct points from customer's balance
  UPDATE public.customer_merchant_link
  SET loyalty_points = loyalty_points - reward_points_required
  WHERE customer_id = target_customer_id AND merchant_id = target_merchant_id;

  RETURN json_build_object(
    'success', true, 
    'points_deducted', reward_points_required, 
    'reward_name', reward_name,
    'customer', customer_profile
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
