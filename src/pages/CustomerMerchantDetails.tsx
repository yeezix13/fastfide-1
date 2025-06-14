
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CustomerMerchantDetails = () => {
  const { merchantId } = useParams();

  return (
    <div className="container mx-auto p-4 md:p-8">
       <div className="mb-4">
        <Button variant="outline" asChild>
          <Link to="/tableau-de-bord-client">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Link>
        </Button>
      </div>
      <h1 className="text-2xl font-bold">Détails du commerçant</h1>
      <p>ID du commerçant : {merchantId}</p>
      <div className="my-8 p-8 border-dashed border-2 rounded-lg text-center text-muted-foreground">
        <p>Le contenu de cette page sera bientôt disponible.</p>
        <p>Ici s'afficheront les récompenses, l'historique des visites et les coordonnées du commerçant.</p>
      </div>
    </div>
  );
};

export default CustomerMerchantDetails;
