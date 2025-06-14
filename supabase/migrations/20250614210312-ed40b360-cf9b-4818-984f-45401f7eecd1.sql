
-- Create a table for user profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  PRIMARY KEY (id)
);

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a table for merchants
CREATE TABLE public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  signup_code TEXT NOT NULL UNIQUE,
  points_per_euro NUMERIC(10, 2) DEFAULT 1.00
);

-- Create a link table between customers and merchants
CREATE TABLE public.customer_merchant_link (
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  loyalty_points INT NOT NULL DEFAULT 0,
  PRIMARY KEY (customer_id, merchant_id)
);

-- Create a table for rewards
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  points_required INT NOT NULL
);

-- Create a table for customer visits
CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  amount_spent NUMERIC(10, 2) NOT NULL,
  points_earned INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_merchant_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view and update their own profile." ON public.profiles FOR ALL USING (auth.uid() = id);

-- RLS Policies for merchants
CREATE POLICY "Anyone can view merchants." ON public.merchants FOR SELECT USING (true);
CREATE POLICY "Merchants can update their own data." ON public.merchants FOR UPDATE USING (auth.uid() = user_id);
-- Note: Creation of merchants will be handled by an admin role in a future step.

-- RLS Policies for customer_merchant_link
CREATE POLICY "Customers can see their own loyalty accounts." ON public.customer_merchant_link FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Customers can create their loyalty account link." ON public.customer_merchant_link FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Merchants can manage their customers' loyalty accounts." ON public.customer_merchant_link FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.merchants m
    WHERE m.id = customer_merchant_link.merchant_id AND m.user_id = auth.uid()
  )
);

-- RLS Policies for rewards
CREATE POLICY "Anyone can view rewards." ON public.rewards FOR SELECT USING (true);
CREATE POLICY "Merchants can manage their own rewards." ON public.rewards FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.merchants m
    WHERE m.id = rewards.merchant_id AND m.user_id = auth.uid()
  )
);

-- RLS Policies for visits
CREATE POLICY "Customers can view their own visits." ON public.visits FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Merchants can manage visits to their store." ON public.visits FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.merchants m
    WHERE m.id = visits.merchant_id AND m.user_id = auth.uid()
  )
);
