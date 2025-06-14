
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import MerchantLoginForm from "@/components/auth/MerchantLoginForm";

const MerchantSpace = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="absolute top-4 left-4">
        <Button variant="outline" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Espace Commerçant</CardTitle>
          <CardDescription>Connectez-vous pour accéder à votre tableau de bord.</CardDescription>
        </CardHeader>
        <CardContent>
          <MerchantLoginForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantSpace;
