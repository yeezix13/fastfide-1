
-- Corriger l'ambiguïté de référence de colonne dans handle_new_user
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
        
        -- Spécifier explicitement la table pour éviter l'ambiguïté
        SELECT EXISTS(SELECT 1 FROM public.profiles p WHERE p.client_code = client_code) INTO code_exists;
        
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
