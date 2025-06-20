
import { supabase } from '@/integrations/supabase/client';

export const checkDuplicates = async (email: string, phone: string) => {
  const [emailCheck, phoneCheck] = await Promise.all([
    supabase.from("profiles").select("id").eq("email", email).maybeSingle(),
    supabase.from("profiles").select("id").eq("phone", phone).maybeSingle()
  ]);

  return {
    emailExists: !!emailCheck.data,
    phoneExists: !!phoneCheck.data,
    emailError: emailCheck.error,
    phoneError: phoneCheck.error
  };
};
