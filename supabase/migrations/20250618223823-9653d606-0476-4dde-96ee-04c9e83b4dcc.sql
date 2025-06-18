
-- Modifier la fonction generate_client_code pour générer un code au format AB277564
CREATE OR REPLACE FUNCTION generate_client_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Générer un code au format AB277564 (2 lettres + 6 chiffres)
        code := CHR((65 + FLOOR(RANDOM() * 26))::INTEGER) || 
                CHR((65 + FLOOR(RANDOM() * 26))::INTEGER) || 
                LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
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

-- Régénérer tous les codes existants avec le nouveau format
UPDATE public.profiles 
SET client_code = generate_client_code() 
WHERE client_code IS NOT NULL;
