
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CustomerPreferences = () => {
  // Le formulaire de modification sera ajouté ici
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="absolute top-4 left-4">
        <Button variant="outline" asChild>
          <Link to="/tableau-de-bord-client">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au tableau de bord
          </Link>
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Mes Préférences</CardTitle>
          <CardDescription>Modifiez vos informations personnelles.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="my-8 p-8 border-dashed border-2 rounded-lg text-center text-muted-foreground">
            <p>Le formulaire pour modifier vos données sera ajouté ici.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerPreferences;
