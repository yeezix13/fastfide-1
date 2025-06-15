
-- Ajoute une colonne pour la date de naissance à la table des profils
ALTER TABLE public.profiles
ADD COLUMN birth_date DATE;

-- Met à jour la fonction qui gère les nouvelles inscriptions pour inclure la date de naissance
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, email, birth_date)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'email',
    (NEW.raw_user_meta_data->>'birth_date')::date
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
