
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fonction pour générer un token plus court et plus sûr
const generateShortToken = (userId: string, email: string): string => {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2, 8);
  return btoa(`${userId.substring(0, 8)}:${randomString}:${timestamp}`);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Request body:', { ...body, newPassword: body.newPassword ? '[HIDDEN]' : undefined });

    const { type, email, userType, resetToken, confirmationToken, firstName, lastName, businessName, newPassword, userId } = body;

    // Nouveau type pour la mise à jour de mot de passe via admin
    if (type === 'admin_password_update') {
      console.log('Admin password update for:', email);
      
      // Mettre à jour le mot de passe via l'API admin
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        (await supabaseAdmin.auth.admin.listUsers()).data.users.find(u => u.email === email)?.id || '',
        { password: newPassword }
      );

      if (error) {
        console.error('Admin password update error:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      console.log('Password updated successfully');
      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Logique existante pour les autres types d'emails
    let emailHtml = '';
    let subject = '';
    let redirectUrl = '';

    if (type === 'password_reset') {
      console.log(`Sending password_reset email to ${email} for ${userType}`);
      
      subject = 'Réinitialisation de votre mot de passe FastFide';
      redirectUrl = `https://app.fastfide.com/reset-password-custom?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px;">
            <h1 style="color: #2563eb;">FastFide</h1>
            <h2>Réinitialisation de votre mot de passe</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
            <p>Bonjour,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte FastFide.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${redirectUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            
            <p><strong>Important :</strong> Ce lien est valide pendant 24 heures.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            
            <p>Cordialement,<br>L'équipe FastFide</p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>© 2024 FastFide. Tous droits réservés.</p>
          </div>
        </div>
      `;
    } else if (type === 'signup_confirmation') {
      console.log(`Sending signup_confirmation email to ${email} for ${userType}`);
      
      subject = 'Confirmez votre inscription à FastFide';
      
      // Générer un token plus court et plus sûr
      const shortToken = generateShortToken(userId || '', email);
      redirectUrl = `https://app.fastfide.com/confirm-email?token=${shortToken}&email=${encodeURIComponent(email)}`;
      
      const displayName = userType === 'merchant' ? businessName : `${firstName} ${lastName}`;
      
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px;">
            <h1 style="color: #2563eb;">FastFide</h1>
            <h2>Bienvenue ${displayName} !</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
            <p>Merci de vous être inscrit(e) à FastFide !</p>
            <p>Pour finaliser votre inscription, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${redirectUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Confirmer mon email
              </a>
            </div>
            
            <p>Une fois votre email confirmé, vous pourrez vous connecter à votre espace ${userType === 'merchant' ? 'commerçant' : 'client'} et profiter de tous nos services.</p>
            
            <p>Cordialement,<br>L'équipe FastFide</p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>© 2024 FastFide. Tous droits réservés.</p>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "FastFide <noreply@fastfide.com>",
      to: [email],
      subject: subject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

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
