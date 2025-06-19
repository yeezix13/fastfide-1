
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const HomePage = () => {
  const navigate = useNavigate();
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
      <div className="flex flex-col items-center mb-8">
        <img 
          src="/lovable-uploads/9c24c620-d700-43f2-bb91-b498726fd2ff.png" 
          alt="FastFide" 
          className="h-32 w-auto mb-4"
        />
        <span className="text-lg text-gray-600 text-center max-w-md">
          Votre fidélité, récompensée localement.
        </span>
      </div>

      {/* Deux blocs de redirection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Bloc Commerçant */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Espace Commerçant</CardTitle>
            <CardDescription>
              Gérez votre programme de fidélité et vos clients
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate("/merchant")}
              className="w-full"
              size="lg"
            >
              Accéder à l'espace commerçant
            </Button>
          </CardContent>
        </Card>

        {/* Bloc Client */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Espace Client</CardTitle>
            <CardDescription>
              Consultez vos points de fidélité et récompenses
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate("/customer")}
              className="w-full"
              size="lg"
            >
              Accéder à l'espace client
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
