
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Store } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-white via-gray-50 to-gray-100 px-2 py-8">
      {/* Logo FastFide centré */}
      <div className="flex flex-col items-center mb-10 py-[26px]">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src="/lovable-uploads/9c24c620-d700-43f2-bb91-b498726fd2ff.png" 
            alt="FastFide Logo" 
            className="h-16 w-auto" 
          />
        </div>
        <span className="text-lg text-gray-500 mt-2 text-center max-w-md">
          Votre fidélité, récompensée localement.
        </span>
      </div>

      <div className="w-full max-w-2xl flex flex-col md:flex-row gap-8 justify-center items-center">
        {/* Carte Client */}
        <div className="bg-white rounded-3xl shadow-xl flex flex-col items-center flex-1 px-6 py-10 md:py-14 md:px-10 animate-fade-in transition-shadow hover:shadow-2xl border border-violet-50">
          <div className="bg-blue-100 rounded-full p-4 mb-4">
            <User className="text-blue-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 md:text-2xl">Je suis client</h2>
          <p className="text-gray-500 text-base mb-6 text-center max-w-xs">
            Cumulez des points chez vos commerçants et profitez d'avantages exclusifs.
          </p>
          <Button asChild size="lg" className="w-full md:w-auto">
            <Link to="/connexion-client">
              Continuer
            </Link>
          </Button>
        </div>
        {/* Carte Commerçant */}
        <div className="bg-white rounded-3xl shadow-xl flex flex-col items-center flex-1 px-6 py-10 md:py-14 md:px-10 animate-fade-in transition-shadow hover:shadow-2xl border border-violet-50">
          <div className="bg-violet-100 rounded-full p-4 mb-4">
            <Store className="text-violet-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 md:text-2xl">Je suis commerçant</h2>
          <p className="text-gray-500 text-base mb-6 text-center max-w-xs">
            Gérez vos programmes de fidélité et analysez vos statistiques simplement.
          </p>
          <Button asChild size="lg" className="w-full md:w-auto">
            <Link to="/connexion-commercant">
              Continuer
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
