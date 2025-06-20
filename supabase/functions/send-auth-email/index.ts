
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

import { EmailRequest } from "./types.ts";
import { corsHeaders, handleCorsRequest } from "./utils/cors.ts";
import { handleCustomerInvitation } from "./handlers/customerInvitation.ts";
import { handleEmailConfirmation } from "./handlers/emailConfirmation.ts";
import { handlePasswordReset } from "./handlers/passwordReset.ts";
import { handleSignupConfirmation } from "./handlers/signupConfirmation.ts";
import { handleAdminPasswordUpdate } from "./handlers/adminPasswordUpdate.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Client admin pour les opérations administratives
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  try {
    const body: EmailRequest = await req.json();
    console.log('Request body:', { ...body, newPassword: body.newPassword ? '[HIDDEN]' : undefined });

    const { type } = body;

    // Router vers le bon handler selon le type d'email
    switch (type) {
      case 'customer_invitation':
        return await handleCustomerInvitation(resend, body);
      
      case 'confirm_email':
        return await handleEmailConfirmation(supabaseAdmin, body);
      
      case 'admin_password_update':
        return await handleAdminPasswordUpdate(supabaseAdmin, body);
      
      case 'password_reset':
        return await handlePasswordReset(resend, body);
      
      case 'signup_confirmation':
        return await handleSignupConfirmation(resend, body);
      
      default:
        return new Response(
          JSON.stringify({ error: `Type d'email non supporté: ${type}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
