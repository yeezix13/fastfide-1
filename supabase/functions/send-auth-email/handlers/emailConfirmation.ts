
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { EmailRequest } from "../types.ts";
import { corsHeaders } from "../utils/cors.ts";
import { decodeToken, isTokenExpired } from "../utils/token.ts";

export const handleEmailConfirmation = async (
  supabaseAdmin: any,
  body: EmailRequest
): Promise<Response> => {
  console.log('Email confirmation for:', body.email);
  
  const { email, token } = body;
  
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Token manquant' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    const { userIdPrefix, randomString, timestamp } = decodeToken(token);
    
    console.log('Token décodé:', { userIdPrefix, randomString, timestamp });

    // Vérifier que le token n'est pas expiré (24h)
    if (isTokenExpired(timestamp, 24)) {
      console.log('Token expiré');
      return new Response(
        JSON.stringify({ error: 'Token expiré' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Rechercher l'utilisateur par email et vérifier le préfixe de l'ID
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Erreur récupération utilisateurs:', usersError);
      throw usersError;
    }

    // Trouver l'utilisateur correspondant
    const matchingUser = usersData?.users?.find((u: any) => 
      u.email === email && 
      u.id.substring(0, 8) === userIdPrefix
    );

    if (!matchingUser) {
      console.log('Utilisateur non trouvé');
      return new Response(
        JSON.stringify({ error: 'Utilisateur non trouvé' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Confirmer l'utilisateur via l'API admin
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(matchingUser.id, {
      email_confirm: true
    });

    if (error) {
      console.error('Erreur confirmation:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log('Email confirmé avec succès');
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error('Erreur lors de la confirmation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};
