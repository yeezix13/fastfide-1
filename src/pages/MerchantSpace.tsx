
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MerchantLoginForm from "@/components/auth/MerchantLoginForm";

const MerchantSpace = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Logo FastFide en haut */}
      <div className="flex flex-col items-center mb-6">
        <img 
          src="/lovable-uploads/9c24c620-d700-43f2-bb91-b498726fd2ff.png" 
          alt="FastFide Logo" 
          className="h-24 w-auto mb-2"
        />
        <span className="text-md text-gray-500 text-center">
          Votre fidélité, récompensée localement.
        </span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Espace Commerçant</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte commerçant pour gérer votre programme de fidélité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MerchantLoginForm />
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              <strong>Nouveau commerçant ?</strong><br />
              Contactez-nous pour créer votre compte et rejoindre FastFide.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantSpace;
