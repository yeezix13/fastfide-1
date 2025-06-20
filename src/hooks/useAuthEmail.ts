
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendConfirmationEmailParams {
  email: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  userType: 'customer' | 'merchant';
  userId: string;
}

interface SendResetPasswordEmailParams {
  email: string;
  userType: 'customer' | 'merchant';
}

export const useAuthEmail = () => {
  const { toast } = useToast();

  const sendConfirmationEmail = async (params: SendConfirmationEmailParams) => {
    try {
      console.log('Sending confirmation email via Resend:', params);

      const { data, error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          type: 'signup_confirmation',
          email: params.email,
          firstName: params.firstName,
          lastName: params.lastName,
          businessName: params.businessName,
          userType: params.userType,
          userId: params.userId,
        },
      });

      if (error) {
        console.error('Error sending confirmation email:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer l'email de confirmation.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Email envoyé",
        description: "Un email de confirmation a été envoyé. Vérifiez votre boîte de réception.",
      });

      return true;
    } catch (error) {
      console.error('Unexpected error sending confirmation email:', error);
      return false;
    }
  };

  const sendResetPasswordEmail = async (params: SendResetPasswordEmailParams) => {
    try {
      console.log('Sending reset password email via Resend:', params);

      const { data, error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          type: 'password_reset',
          email: params.email,
          userType: params.userType,
          resetToken: btoa(`${params.email}:${Date.now()}`),
        },
      });

      if (error) {
        console.error('Error sending reset password email:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer l'email de réinitialisation.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Email envoyé",
        description: "Un lien de réinitialisation a été envoyé à votre email.",
      });

      return true;
    } catch (error) {
      console.error('Unexpected error sending reset password email:', error);
      return false;
    }
  };

  return {
    sendConfirmationEmail,
    sendResetPasswordEmail,
  };
};
