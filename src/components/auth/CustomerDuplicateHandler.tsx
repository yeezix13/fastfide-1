
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ForgotPasswordForm from "./ForgotPasswordForm";

interface CustomerDuplicateHandlerProps {
  duplicateInfo: {
    email?: boolean;
    phone?: boolean;
    emailValue?: string;
  };
  onBack: () => void;
}

const CustomerDuplicateHandler = ({ duplicateInfo, onBack }: CustomerDuplicateHandlerProps) => {
  const { toast } = useToast();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLoginRedirect = () => {
    // Rediriger vers la page de connexion client
    window.location.href = "/connexion-client";
  };

  if (showForgotPassword) {
    return (
      <div className="space-y-4">
        <ForgotPasswordForm onBackToLogin={() => setShowForgotPassword(false)} />
        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={onBack}
        >
          ← Retour à l'inscription
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold">Un compte existe déjà avec ces informations :</p>
            <div className="space-y-1">
              {duplicateInfo.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3" />
                  <span>Adresse email déjà utilisée</span>
                </div>
              )}
              {duplicateInfo.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3 w-3" />
                  <span>Numéro de téléphone déjà utilisé</span>
                </div>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <p className="text-sm text-gray-600 text-center">
          Que souhaitez-vous faire ?
        </p>
        
        <div className="space-y-2">
          <Button 
            onClick={handleLoginRedirect}
            className="w-full"
            variant="default"
          >
            Me connecter avec mon compte existant
          </Button>
          
          {duplicateInfo.email && (
            <Button 
              onClick={() => setShowForgotPassword(true)}
              className="w-full"
              variant="outline"
            >
              Réinitialiser mon mot de passe
            </Button>
          )}
          
          <Button 
            onClick={onBack}
            className="w-full"
            variant="ghost"
          >
            Modifier mes informations d'inscription
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDuplicateHandler;
