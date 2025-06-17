
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'points_earned' | 'reward_redeemed';
  customerEmail: string;
  customerName: string;
  merchantName: string;
  merchantColor?: string;
  points?: number;
  amount?: number;
  rewardName?: string;
  pointsSpent?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      type, 
      customerEmail, 
      customerName, 
      merchantName, 
      merchantColor = '#2563eb',
      points, 
      amount, 
      rewardName, 
      pointsSpent 
    }: NotificationRequest = await req.json();

    console.log(`Sending ${type} notification to ${customerEmail}`);

    let emailContent = '';
    let subject = '';

    if (type === 'points_earned') {
      subject = `🎉 Vous avez gagné ${points} points chez ${merchantName} !`;
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${merchantColor}; font-size: 28px; margin: 0;">Félicitations !</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, ${merchantColor}20, ${merchantColor}10); border-radius: 15px; padding: 25px; margin-bottom: 25px; border-left: 4px solid ${merchantColor};">
            <h2 style="color: ${merchantColor}; margin-top: 0;">Bonjour ${customerName},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Votre visite chez <strong>${merchantName}</strong> vous a rapporté <strong style="color: ${merchantColor};">${points} points</strong> !
            </p>
            ${amount ? `<p style="font-size: 14px; color: #666;">Montant dépensé : ${amount}€</p>` : ''}
          </div>
          
          <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              Continuez à cumuler des points pour débloquer des récompenses exclusives !
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              FastFide - Votre fidélité, récompensée localement
            </p>
          </div>
        </div>
      `;
    } else if (type === 'reward_redeemed') {
      subject = `🎁 Votre récompense "${rewardName}" chez ${merchantName}`;
      emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${merchantColor}; font-size: 28px; margin: 0;">Récompense utilisée !</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, ${merchantColor}20, ${merchantColor}10); border-radius: 15px; padding: 25px; margin-bottom: 25px; border-left: 4px solid ${merchantColor};">
            <h2 style="color: ${merchantColor}; margin-top: 0;">Bonjour ${customerName},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              Vous venez d'utiliser votre récompense <strong>"${rewardName}"</strong> chez <strong>${merchantName}</strong> !
            </p>
            <p style="font-size: 14px; color: #666;">
              Points utilisés : <strong style="color: ${merchantColor};">${pointsSpent}</strong>
            </p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 14px;">
              Profitez bien de votre récompense ! N'hésitez pas à revenir pour gagner encore plus de points.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              FastFide - Votre fidélité, récompensée localement
            </p>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "FastFide <noreply@fastfide.com>",
      to: [customerEmail],
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
    console.error("Error sending notification:", error);
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
