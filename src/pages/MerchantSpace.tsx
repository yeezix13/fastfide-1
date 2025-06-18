
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MerchantLoginForm from "@/components/auth/MerchantLoginForm";
import MerchantSignUpForm from "@/components/auth/MerchantSignUpForm";

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

      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Espace Commerçant</CardTitle>
          <CardDescription>Connectez-vous ou créez votre compte commerçant pour gérer votre programme de fidélité.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="connexion" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connexion">Connexion</TabsTrigger>
              <TabsTrigger value="inscription">Créer un compte</TabsTrigger>
            </TabsList>
            <TabsContent value="connexion">
              <MerchantLoginForm />
            </TabsContent>
            <TabsContent value="inscription">
              <MerchantSignUpForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantSpace;
