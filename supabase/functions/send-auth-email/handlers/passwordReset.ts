
import { Resend } from "npm:resend@2.0.0";
import { EmailRequest } from "../types.ts";
import { corsHeaders } from "../utils/cors.ts";

export const handlePasswordReset = async (
  resend: Resend,
  body: EmailRequest
): Promise<Response> => {
  console.log(`Sending password_reset email to ${body.email} for ${body.userType}`);
  
  const { email, resetToken, userType } = body;
  
  const subject = 'Réinitialisation de votre mot de passe FastFide';
  const redirectUrl = `https://app.fastfide.com/reset-password-custom?token=${resetToken}&email=${encodeURIComponent(email)}`;
  
  const emailHtml = `
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
};
