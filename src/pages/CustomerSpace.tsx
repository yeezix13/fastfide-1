
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerLoginForm from "@/components/auth/CustomerLoginForm";
import CustomerSignUpForm from "@/components/auth/CustomerSignUpForm";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const CustomerSpace = () => {
  const { loading, user, userType } = useAuthRedirect();

  // Redirection automatique si l'utilisateur est connecté
  if (!loading && user && userType) {
    return null; // Le hook s'occupe de la redirection
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Logo FastFide en haut */}
      <div className="flex flex-col items-center mb-6">
        <img 
          src="/lovable-uploads/9c24c620-d700-43f2-bb91-b498726fd2ff.png" 
          alt="FastFide" 
          className="h-24 w-auto mb-2"
        />
        <span className="text-md text-gray-500 text-center">
          Votre fidélité, récompensée localement.
        </span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Espace Client</CardTitle>
          <CardDescription>Connectez-vous ou inscrivez-vous pour accéder à votre espace fidélité.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="connexion" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connexion">Connexion</TabsTrigger>
              <TabsTrigger value="inscription">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value="connexion">
              <CustomerLoginForm />
            </TabsContent>
            <TabsContent value="inscription">
              <CustomerSignUpForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSpace;
