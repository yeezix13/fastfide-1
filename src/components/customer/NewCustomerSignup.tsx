
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerSignUpForm from '@/components/auth/CustomerSignUpForm';

interface NewCustomerSignupProps {
  merchantId: string;
  merchantName: string;
  themeColor: string;
}

const NewCustomerSignup = ({ merchantId, merchantName, themeColor }: NewCustomerSignupProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center" style={{ color: themeColor }}>
          Créer un nouveau compte
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          Inscrivez-vous pour rejoindre <strong>{merchantName}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <CustomerSignUpForm merchantId={merchantId} />
      </CardContent>
    </Card>
  );
};

export default NewCustomerSignup;
