
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import MerchantLogo from '@/components/ui/merchant-logo';
import Spinner from '@/components/ui/spinner';
import { useMerchantByCode } from '@/hooks/useMerchantByCode';
import ExistingCustomerLogin from '@/components/customer/ExistingCustomerLogin';
import NewCustomerSignup from '@/components/customer/NewCustomerSignup';

const CustomerSignUpPage = () => {
  const [searchParams] = useSearchParams();
  const merchantParam = searchParams.get("merchant");
  const { data: merchant, isLoading: loading, error } = useMerchantByCode(merchantParam);

  if (loading && merchantParam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Définir le style de background basé sur la couleur du commerçant
  const backgroundStyle = merchant?.theme_color 
    ? {
        background: `linear-gradient(135deg, ${merchant.theme_color}15 0%, ${merchant.theme_color}08 50%, white 100%)`
      }
    : {};

  const backgroundClass = merchant?.theme_color 
    ? "" 
    : "bg-gradient-to-br from-gray-50 to-white";

  // Si pas de code commerçant, afficher la page d'inscription normale
  if (!merchantParam) {
    return (
      <div 
        className={`min-h-screen flex flex-col items-center justify-center p-4 ${backgroundClass}`}
        style={backgroundStyle}
      >
        <div className="absolute top-16 left-4">
          <Button variant="outline" asChild>
            <Link to="/customer">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
            </Link>
          </Button>
        </div>
        
        <Card className="w-full max-w-md mt-20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Inscription Client</CardTitle>
            <CardDescription>
              Connectez-vous ou inscrivez-vous pour accéder à votre espace fidélité.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewCustomerSignup 
              merchantId=""
              merchantName=""
              themeColor="#2563eb"
            />
            {error && (
              <div className="mt-3 text-red-500 text-center text-sm">{error.message}</div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si le commerçant n'est pas trouvé
  if (!merchant && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-red-500">Commerçant non trouvé</p>
            <Button variant="outline" asChild className="mt-4">
              <Link to="/customer">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center p-4 ${backgroundClass}`}
      style={backgroundStyle}
    >
      <div className="w-full max-w-6xl">
        {/* En-tête avec le logo du commerçant */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-4">
            <div className="mb-3">
              <MerchantLogo 
                logoUrl={merchant.logo_url} 
                merchantName={merchant.name} 
                size="xl"
              />
            </div>
            <h1 
              className="text-3xl font-bold mb-2" 
              style={{ color: merchant.theme_color || '#2563eb' }}
            >
              {merchant.name}
            </h1>
            <p className="text-muted-foreground">
              Rejoignez notre programme de fidélité
            </p>
          </div>
        </div>

        {/* Contenu principal avec deux colonnes */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Colonne gauche - Connexion pour clients existants */}
          <div className="space-y-4">
            <ExistingCustomerLogin 
              merchantCode={merchantParam}
              merchantName={merchant.name}
              themeColor={merchant.theme_color || '#2563eb'}
            />
          </div>

          {/* Colonne droite - Inscription nouveaux clients */}
          <div className="space-y-4">
            <NewCustomerSignup 
              merchantId={merchant.id}
              merchantName={merchant.name}
              themeColor={merchant.theme_color || '#2563eb'}
            />
          </div>
        </div>

        {/* Séparateur visuel */}
        <div className="flex items-center justify-center my-8">
          <div className="flex-1 border-t border-gray-300 max-w-sm"></div>
          <div className="px-4 text-gray-500 text-sm">OU</div>
          <div className="flex-1 border-t border-gray-300 max-w-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignUpPage;
