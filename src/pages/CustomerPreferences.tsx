
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerPreferencesForm from '@/components/customer/CustomerPreferencesForm';
import { useCustomerProfile } from '@/hooks/useCustomerProfile';
import { useDeviceType } from '@/hooks/useDeviceType';
import MobileBackButton from '@/components/ui/mobile-back-button';

const CustomerPreferences = () => {
  const { user, profile, isLoadingProfile, updateProfile, isUpdating } = useCustomerProfile();
  const { isMobile } = useDeviceType();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {isMobile ? (
        <MobileBackButton to="/tableau-de-bord-client" />
      ) : (
        <div className="absolute top-4 left-4">
          <Button variant="outline" asChild>
            <Link to="/tableau-de-bord-client">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour au tableau de bord
            </Link>
          </Button>
        </div>
      )}
      <Card className={`w-full max-w-md ${isMobile ? 'mt-20' : ''}`}>
        <CardHeader>
          <CardTitle>Mes Préférences</CardTitle>
          <CardDescription>Modifiez vos informations personnelles.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingProfile ? (
            <p>Chargement de vos informations...</p>
          ) : (
            <CustomerPreferencesForm
              profile={profile}
              user={user}
              onSubmit={updateProfile}
              isLoading={isUpdating}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerPreferences;
