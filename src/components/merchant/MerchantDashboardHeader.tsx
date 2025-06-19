
import { Button } from '@/components/ui/button';
import { LogOut, UserPlus, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useDeviceType } from '@/hooks/useDeviceType';
import MerchantLogo from '@/components/ui/merchant-logo';

interface MerchantDashboardHeaderProps {
  merchant: {
    name: string;
    logo_url?: string;
    theme_color?: string;
  };
  onLogout: () => void;
}

const MerchantDashboardHeader = ({ merchant, onLogout }: MerchantDashboardHeaderProps) => {
  const { isMobile } = useDeviceType();
  const themeColor = merchant.theme_color || "#6366f1";
  const lightBg = `${themeColor}17`;

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="flex flex-col space-y-4 mt-8">
          <Button
            asChild
            style={{
              backgroundColor: themeColor,
              borderColor: themeColor,
            }}
            className="text-white hover:opacity-90 justify-start"
          >
            <Link to="/tableau-de-bord-commercant/inscrire-client">
              <UserPlus className="w-4 h-4 mr-2" />
              Inscrire un client
            </Link>
          </Button>
          <Button
            onClick={onLogout}
            variant="outline"
            style={{
              color: themeColor,
              borderColor: themeColor,
              background: lightBg,
              fontWeight: 600,
            }}
            className="hover:bg-opacity-15 justify-start"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Déconnexion
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className={`flex ${isMobile ? 'flex-col space-y-4 pt-8 pb-4' : 'justify-between items-center'} py-6 px-4 md:px-8 rounded-b-lg bg-white shadow-md mb-8`}>
      <div className={`flex items-center gap-4 ${isMobile ? 'justify-center' : ''}`}>
        <MerchantLogo 
          logoUrl={merchant.logo_url} 
          merchantName={merchant.name} 
          size={isMobile ? "md" : "lg"}
        />
        <h1
          className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold tracking-tight`}
          style={{ color: themeColor }}
        >
          {merchant.name}
        </h1>
      </div>
      <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
        {isMobile ? (
          <MobileMenu />
        ) : (
          <>
            <Button
              asChild
              style={{
                backgroundColor: themeColor,
                borderColor: themeColor,
              }}
              className="text-white hover:opacity-90"
            >
              <Link to="/tableau-de-bord-commercant/inscrire-client">
                <UserPlus className="w-4 h-4 mr-2" />
                Inscrire un client
              </Link>
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              style={{
                color: themeColor,
                borderColor: themeColor,
                background: lightBg,
                fontWeight: 600,
              }}
              className="hover:bg-opacity-15"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Déconnexion
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default MerchantDashboardHeader;
