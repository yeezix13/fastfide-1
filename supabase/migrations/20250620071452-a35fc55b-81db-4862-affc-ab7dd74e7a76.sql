
-- Vérifier l'état actuel des fonctions
SELECT routine_name, routine_schema 
FROM information_schema.routines 
WHERE routine_name IN ('generate_client_code', 'handle_new_user');

-- Supprimer complètement les fonctions existantes pour repartir à zéro
DROP FUNCTION IF EXISTS public.generate_client_code() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer une version simplifiée de handle_new_user qui génère le code directement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    client_code TEXT;
    code_exists BOOLEAN;
BEGIN
    -- Générer un code client unique directement dans la fonction
    LOOP
        client_code := CHR(65 + (RANDOM() * 25)::INTEGER) || 
                      CHR(65 + (RANDOM() * 25)::INTEGER) || 
                      LPAD((RANDOM() * 999999)::INTEGER::TEXT, 6, '0');
        
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE client_code = client_code) INTO code_exists;
        
        IF NOT code_exists THEN
            EXIT;
        END IF;
    END LOOP;

    -- Log des données reçues pour debugging
    RAISE LOG 'Creating user profile for ID: %, Email: %, RGPD: %', 
        NEW.id, 
        NEW.raw_user_meta_data->>'email',
        NEW.raw_user_meta_data->>'rgpd_consent';

    INSERT INTO public.profiles (
        id, 
        first_name, 
        last_name, 
        phone, 
        email, 
        birth_date,
        client_code,
        rgpd_consent,
        marketing_consent,
        rgpd_consent_date,
        marketing_consent_date
    )
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'email',
        CASE 
            WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL AND NEW.raw_user_meta_data->>'birth_date' != ''
            THEN (NEW.raw_user_meta_data->>'birth_date')::date 
            ELSE NULL 
        END,
        client_code,
        COALESCE((NEW.raw_user_meta_data->>'rgpd_consent')::boolean, false),
        COALESCE((NEW.raw_user_meta_data->>'marketing_consent')::boolean, false),
        CASE 
            WHEN COALESCE((NEW.raw_user_meta_data->>'rgpd_consent')::boolean, false) = true
            THEN COALESCE((NEW.raw_user_meta_data->>'rgpd_consent_date')::timestamptz, NOW())
            ELSE NULL 
        END,
        CASE 
            WHEN COALESCE((NEW.raw_user_meta_data->>'marketing_consent')::boolean, false) = true
            THEN COALESCE((NEW.raw_user_meta_data->>'marketing_consent_date')::timestamptz, NOW())
            ELSE NULL 
        END
    );
    
    RAISE LOG 'Profile created successfully for user: %', NEW.id;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RAISE;
END;
$$;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Vérifier que la fonction a été créée
SELECT routine_name, routine_schema 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
