
-- Function to record a customer visit and award points
CREATE OR REPLACE FUNCTION public.record_visit(
  customer_phone_number TEXT,
  merchant_user_id UUID,
  spent_amount NUMERIC
)
RETURNS JSON AS $$
DECLARE
  target_customer_id UUID;
  target_merchant_id UUID;
  points_per_euro_rate NUMERIC;
  earned_points INT;
  customer_link_exists BOOLEAN;
  customer_profile JSON;
BEGIN
  -- 1. Find merchant_id and points rate from merchant's user_id
  SELECT id, points_per_euro INTO target_merchant_id, points_per_euro_rate
  FROM public.merchants
  WHERE user_id = merchant_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Commerçant non trouvé.');
  END IF;

  -- 2. Find customer_id from phone number in profiles table
  SELECT id, json_build_object('first_name', first_name, 'last_name', last_name) INTO target_customer_id, customer_profile
  FROM public.profiles
  WHERE phone = customer_phone_number;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Client avec ce numéro de téléphone non trouvé.');
  END IF;

  -- 3. Check if a link already exists between customer and merchant
  SELECT EXISTS (
    SELECT 1 FROM public.customer_merchant_link
    WHERE customer_id = target_customer_id AND merchant_id = target_merchant_id
  ) INTO customer_link_exists;

  -- If no link, create one
  IF NOT customer_link_exists THEN
    INSERT INTO public.customer_merchant_link (customer_id, merchant_id, loyalty_points)
    VALUES (target_customer_id, target_merchant_id, 0);
  END IF;

  -- 4. Calculate points earned
  earned_points := floor(spent_amount * points_per_euro_rate);

  -- 5. Insert into visits table
  INSERT INTO public.visits (customer_id, merchant_id, amount_spent, points_earned)
  VALUES (target_customer_id, target_merchant_id, spent_amount, earned_points);

  -- 6. Update loyalty points for the customer
  UPDATE public.customer_merchant_link
  SET loyalty_points = loyalty_points + earned_points
  WHERE customer_id = target_customer_id AND merchant_id = target_merchant_id;

  RETURN json_build_object('success', true, 'points_earned', earned_points, 'customer', customer_profile);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to redeem a reward for a customer
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
  SELECT points_required INTO reward_points_required
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

  -- 6. Deduct points from customer's balance
  UPDATE public.customer_merchant_link
  SET loyalty_points = loyalty_points - reward_points_required
  WHERE customer_id = target_customer_id AND merchant_id = target_merchant_id;

  RETURN json_build_object('success', true, 'points_deducted', reward_points_required, 'customer', customer_profile);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
