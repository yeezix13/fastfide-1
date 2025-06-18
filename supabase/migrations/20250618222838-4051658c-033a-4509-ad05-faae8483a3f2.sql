
-- Ajouter un champ pour le code unique client dans la table profiles
ALTER TABLE public.profiles 
ADD COLUMN client_code TEXT UNIQUE;

-- Créer une fonction pour générer un code unique au format 123 AB 123
CREATE OR REPLACE FUNCTION generate_client_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Générer un code au format 123 AB 123
        code := LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0') || ' ' ||
                CHR((65 + FLOOR(RANDOM() * 26))::INTEGER) || CHR((65 + FLOOR(RANDOM() * 26))::INTEGER) || ' ' ||
                LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
        
        -- Vérifier si le code existe déjà
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE client_code = code) INTO exists_check;
        
        -- Si le code n'existe pas, on sort de la boucle
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Générer des codes pour les profils existants qui n'en ont pas
UPDATE public.profiles 
SET client_code = generate_client_code() 
WHERE client_code IS NULL;

-- Modifier la fonction handle_new_user pour inclure la génération du code client
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, email, birth_date, client_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'email',
    (NEW.raw_user_meta_data->>'birth_date')::date,
    generate_client_code()
  );
  RETURN NEW;
END;
$$;
