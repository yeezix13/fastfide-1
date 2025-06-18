
import { CardHeader, CardTitle } from '@/components/ui/card';
import MerchantLogo from '@/components/ui/merchant-logo';

interface CustomerSignupHeaderProps {
  merchant: {
    name: string;
    logo_url?: string;
  };
  themeColor: string;
}

const CustomerSignupHeader = ({ merchant, themeColor }: CustomerSignupHeaderProps) => {
  return (
    <CardHeader className="text-center pb-6">
      <div className="flex items-center justify-center gap-4 mb-4">
        <MerchantLogo 
          logoUrl={merchant.logo_url} 
          merchantName={merchant.name} 
          size="lg"
        />
        <div>
          <CardTitle className="text-2xl" style={{ color: themeColor }}>
            Inscrire un nouveau client
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Commerce : {merchant.name}
          </p>
        </div>
      </div>
    </CardHeader>
  );
};

export default CustomerSignupHeader;
