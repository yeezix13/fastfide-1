
import { EmailRequest } from "../types.ts";
import { corsHeaders } from "../utils/cors.ts";

export const handleAdminPasswordUpdate = async (
  supabaseAdmin: any,
  body: EmailRequest
): Promise<Response> => {
  console.log('Admin password update for:', body.email);
  
  const { email, newPassword } = body;
  
  // Trouver l'utilisateur par email
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return new Response(
      JSON.stringify({ error: usersError.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  const user = usersData.users.find((u: any) => u.email === email);
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Utilisateur non trouvé' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  // Mettre à jour le mot de passe via l'API admin
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
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
};
