
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  type: 'signup_confirmation' | 'password_reset';
  email: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  userType: 'customer' | 'merchant';
  confirmationToken?: string;
  resetToken?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      type, 
      email, 
      firstName, 
      lastName, 
      businessName,
      userType,
      confirmationToken,
      resetToken
    }: AuthEmailRequest = await req.json();

    console.log(`Sending ${type} email to ${email} for ${userType}`);

    let emailContent = '';
    let subject = '';
    const appUrl = 'https://app.fastfide.com';

    if (type === 'signup_confirmation') {
      const displayName = userType === 'merchant' 
        ? (businessName || `${firstName} ${lastName}`)
        : `${firstName} ${lastName}`;
      
      const confirmUrl = `${appUrl}/confirm-email?token=${confirmationToken}&email=${encodeURIComponent(email)}&type=${userType}`;
      
      subject = userType === 'merchant' 
        ? `Confirmez votre inscription commerçant - FastFide`
        : `Confirmez votre inscription client - FastFide`;

      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 28px; margin: 0;">Bienvenue sur FastFide !</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #2563eb20, #2563eb10); border-radius: 15px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #2563eb;">
            <h2 style="color: #2563eb; margin-top: 0;">Bonjour ${displayName},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Merci de vous être inscrit${userType === 'merchant' ? ' en tant que commerçant' : ''} sur FastFide !
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Pour finaliser votre inscription et activer votre compte, veuillez cliquer sur le bouton ci-dessous :
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Confirmer mon inscription
            </a>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
            </p>
            <p style="color: #2563eb; font-size: 14px; word-break: break-all; margin: 10px 0 0 0;">
              ${confirmUrl}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Ce lien est valide pendant 24 heures.<br>
              FastFide - Votre fidélité, récompensée localement
            </p>
          </div>
        </div>
      `;
    } else if (type === 'password_reset') {
      const resetUrl = `${appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      subject = `Réinitialisation de votre mot de passe - FastFide`;

      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 28px; margin: 0;">Réinitialisation du mot de passe</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, #2563eb20, #2563eb10); border-radius: 15px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #2563eb;">
            <h2 style="color: #2563eb; margin-top: 0;">Bonjour,</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Vous avez demandé la réinitialisation de votre mot de passe FastFide.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
            </p>
            <p style="color: #2563eb; font-size: 14px; word-break: break-all; margin: 10px 0 0 0;">
              ${resetUrl}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Ce lien est valide pendant 1 heure.<br>
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.<br>
              FastFide - Votre fidélité, récompensée localement
            </p>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "FastFide <noreply@fastfide.com>",
      to: [email],
      subject,
      html: emailContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending auth email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
