
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RewardNotificationRequest {
  customerEmail: string;
  customerName: string;
  rewardName: string;
  merchantName: string;
  pointsSpent: number;
}

async function sendSMTPEmail(
  to: string, 
  subject: string, 
  htmlContent: string, 
  textContent: string
) {
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "465");
  const smtpUser = Deno.env.get("SMTP_USER");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");
  
  if (!smtpHost || !smtpUser || !smtpPassword) {
    throw new Error("Configuration SMTP manquante");
  }

  // Créer la connexion SMTP
  const conn = await Deno.connect({
    hostname: smtpHost,
    port: smtpPort,
    transport: "tcp",
  });

  // Fonction pour envoyer une commande SMTP et lire la réponse
  async function sendCommand(command: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    await conn.write(encoder.encode(command + "\r\n"));
    
    const buffer = new Uint8Array(1024);
    const n = await conn.read(buffer);
    return decoder.decode(buffer.subarray(0, n || 0));
  }

  try {
    // Handshake SMTP
    await sendCommand("EHLO fastfide.com");
    
    // Authentification
    await sendCommand("AUTH LOGIN");
    await sendCommand(btoa(smtpUser));
    await sendCommand(btoa(smtpPassword));
    
    // Définir l'expéditeur et le destinataire
    await sendCommand(`MAIL FROM:<${smtpUser}>`);
    await sendCommand(`RCPT TO:<${to}>`);
    
    // Commencer les données
    await sendCommand("DATA");
    
    // Construire le message email
    const emailMessage = [
      `From: FastFidé <${smtpUser}>`,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${btoa(subject)}?=`,
      "MIME-Version: 1.0",
      "Content-Type: multipart/alternative; boundary=\"boundary123\"",
      "",
      "--boundary123",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      textContent,
      "",
      "--boundary123",
      "Content-Type: text/html; charset=UTF-8",
      "",
      htmlContent,
      "",
      "--boundary123--",
      "",
      "."
    ].join("\r\n");
    
    await sendCommand(emailMessage);
    await sendCommand("QUIT");
    
    console.log(`Email envoyé avec succès à ${to}`);
    return "Email envoyé avec succès";
    
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  } finally {
    conn.close();
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      customerEmail, 
      customerName, 
      rewardName, 
      merchantName, 
      pointsSpent 
    }: RewardNotificationRequest = await req.json();

    // Valider les données requises
    if (!customerEmail || !customerName || !rewardName || !merchantName || !pointsSpent) {
      return new Response(
        JSON.stringify({ error: "Données manquantes" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const subject = `🎉 Félicitations ! Vous avez reçu une récompense chez ${merchantName}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Récompense reçue</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; text-align: center;">🎉 Félicitations ${customerName} !</h1>
            
            <p style="font-size: 18px; text-align: center; margin: 20px 0;">
              Vous avez utilisé avec succès votre récompense chez <strong>${merchantName}</strong> !
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #2563eb; margin-top: 0;">Détails de votre récompense :</h2>
              <p><strong>Récompense :</strong> ${rewardName}</p>
              <p><strong>Commerce :</strong> ${merchantName}</p>
              <p><strong>Points utilisés :</strong> ${pointsSpent} points</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              Merci de votre fidélité ! Continuez à cumuler des points pour débloquer d'autres récompenses.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666; text-align: center;">
              Cet email a été envoyé automatiquement par FastFidé.<br>
              Si vous avez des questions, contactez directement le commerce.
            </p>
          </div>
        </body>
      </html>
    `;
    
    const textContent = `
Félicitations ${customerName} !

Vous avez utilisé avec succès votre récompense chez ${merchantName} !

Détails de votre récompense :
- Récompense : ${rewardName}
- Commerce : ${merchantName}
- Points utilisés : ${pointsSpent} points

Merci de votre fidélité ! Continuez à cumuler des points pour débloquer d'autres récompenses.

---
Cet email a été envoyé automatiquement par FastFidé.
Si vous avez des questions, contactez directement le commerce.
    `;

    await sendSMTPEmail(customerEmail, subject, htmlContent, textContent);

    return new Response(
      JSON.stringify({ success: true, message: "Email de notification envoyé" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Erreur dans send-reward-notification:", error);
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
