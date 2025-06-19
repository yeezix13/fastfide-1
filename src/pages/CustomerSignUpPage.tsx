import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import MerchantLogo from '@/components/ui/merchant-logo';
import Spinner from '@/components/ui/spinner';
import CustomerSignUpForm from '@/components/auth/CustomerSignUpForm';
import { useMerchantByCode } from '@/hooks/useMerchantByCode';

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      {/* On affiche le bouton retour uniquement s'il n'y a pas de code commerçant dans l'URL */}
      {!merchantParam && (
        <div className="absolute top-16 left-4">
          <Button variant="outline" asChild>
            <Link to="/customer">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
            </Link>
          </Button>
        </div>
      )}
      
      <Card className="w-full max-w-md mt-20">
        <CardHeader className="text-center">
          {/* Affichage du commerçant avec son logo ou initiales */}
          {merchant && (
            <div className="flex flex-col items-center mb-4">
              <div className="mb-3">
                <MerchantLogo 
                  logoUrl={merchant.logo_url} 
                  merchantName={merchant.name} 
                  size="xl"
                />
              </div>
              <h3 
                className="text-xl font-bold mb-2" 
                style={{ color: merchant.theme_color || '#2563eb' }}
              >
                {merchant.name}
              </h3>
            </div>
          )}
          
          <CardTitle className="text-2xl">Inscription Client</CardTitle>
          <CardDescription>
            {merchant
              ? <>Créez votre compte pour rejoindre <span className="font-bold" style={{ color: merchant.theme_color || '#2563eb' }}>{merchant.name}</span>.<br />Vous serez automatiquement associé à ce commerçant.</>
              : <>Connectez-vous ou inscrivez-vous pour accéder à votre espace fidélité.</>
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerSignUpForm merchantId={merchant?.id} />
          {error && (
            <div className="mt-3 text-red-500 text-center text-sm">{error.message}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSignUpPage;
