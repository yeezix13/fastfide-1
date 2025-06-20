
import { Resend } from "npm:resend@2.0.0";
import { EmailRequest } from "../types.ts";
import { corsHeaders } from "../utils/cors.ts";
import { generateShortToken } from "../utils/token.ts";

export const handleSignupConfirmation = async (
  resend: Resend,
  body: EmailRequest
): Promise<Response> => {
  console.log(`Sending signup_confirmation email to ${body.email} for ${body.userType}`);
  
  const { email, userType, firstName, lastName, businessName, userId } = body;
  
  const subject = 'Confirmez votre inscription à FastFide';
  
  // Générer un token plus court et plus sûr
  const shortToken = generateShortToken(userId || '', email);
  const redirectUrl = `https://app.fastfide.com/confirm-email?token=${shortToken}&email=${encodeURIComponent(email)}`;
  
  const displayName = userType === 'merchant' ? businessName : `${firstName} ${lastName}`;
  
  const emailHtml = `
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
