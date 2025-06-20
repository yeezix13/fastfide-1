
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useClientCode } from "@/hooks/useClientCode";

interface ClientCodeDisplayProps {
  customerId: string | null;
}

const ClientCodeDisplay = ({ customerId }: ClientCodeDisplayProps) => {
  const { toast } = useToast();
  const { data: clientData, isLoading } = useClientCode(customerId);

  const copyToClipboard = async () => {
    if (clientData?.client_code) {
      try {
        await navigator.clipboard.writeText(clientData.client_code);
        toast({
          title: "Code copié",
          description: "Votre code client a été copié dans le presse-papiers.",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de copier le code.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Code Client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!clientData?.client_code) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Code Client
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-lg font-mono px-3 py-1">
              {clientData.client_code}
            </Badge>
            <div className="text-sm text-gray-600">
              {clientData.first_name} {clientData.last_name}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copier
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Ce code vous identifie de manière unique auprès de vos commerçants partenaires.
        </p>
      </CardContent>
    </Card>
  );
};

export default ClientCodeDisplay;
