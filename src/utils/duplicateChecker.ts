
import { supabase } from '@/integrations/supabase/client';

export const checkDuplicates = async (email: string, phone: string | null) => {
  const [emailCheck, phoneCheck] = await Promise.all([
    supabase.from("profiles").select("id").eq("email", email).maybeSingle(),
    phone ? supabase.from("profiles").select("id").eq("phone", phone).maybeSingle() : Promise.resolve({ data: null, error: null })
  ]);

  return {
    emailExists: !!emailCheck.data,
    phoneExists: !!phoneCheck.data,
    emailError: emailCheck.error,
    phoneError: phoneCheck.error
  };
};
