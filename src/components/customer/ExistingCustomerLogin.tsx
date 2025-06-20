
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ExistingCustomerLoginProps {
  merchantCode: string;
  merchantName: string;
  themeColor: string;
}

const ExistingCustomerLogin = ({ merchantCode, merchantName, themeColor }: ExistingCustomerLoginProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center" style={{ color: themeColor }}>
          J'ai déjà un compte FastFide
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Si vous avez déjà un compte FastFide, connectez-vous pour rejoindre {merchantName} avec le code {merchantCode}.
        </p>
        <Button 
          asChild
          className="w-full"
          style={{ backgroundColor: themeColor }}
        >
          <Link to="/customer">
            <LogIn className="mr-2 h-4 w-4" />
            Aller à l'espace de connexion
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExistingCustomerLogin;
