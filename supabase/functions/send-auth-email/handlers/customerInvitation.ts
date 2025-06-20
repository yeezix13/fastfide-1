
import { Resend } from "npm:resend@2.0.0";
import { EmailRequest, EmailResponse } from "../types.ts";
import { corsHeaders } from "../utils/cors.ts";

export const handleCustomerInvitation = async (
  resend: Resend,
  body: EmailRequest
): Promise<Response> => {
  console.log('Customer invitation for:', body.email);
  
  const { email, merchantName, signupUrl } = body;
  
  const subject = `${merchantName} vous invite à rejoindre son programme de fidélité !`;
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 20px;">
        <h1 style="color: #2563eb;">FastFide</h1>
        <h2>Invitation de ${merchantName}</h2>
      </div>
      
      <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
        <p>Bonjour,</p>
        <p><strong>${merchantName}</strong> vous invite à rejoindre son programme de fidélité via FastFide !</p>
        <p>Cliquez sur le bouton ci-dessous pour créer votre compte et commencer à cumuler des points :</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${signupUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Créer mon compte fidélité
          </a>
        </div>
        
        <p>Une fois votre compte créé, vous serez automatiquement associé à ${merchantName} et pourrez profiter de toutes les récompenses disponibles.</p>
        
        <p>À bientôt !<br>L'équipe FastFide</p>
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
