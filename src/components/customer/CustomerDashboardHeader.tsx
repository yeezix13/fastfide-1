
import { Button } from '@/components/ui/button';
import { Settings, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useDeviceType } from '@/hooks/useDeviceType';

interface CustomerDashboardHeaderProps {
  displayName: string;
  clientCode?: string;
  email: string;
  onLogout: () => void;
}

const CustomerDashboardHeader = ({ displayName, clientCode, email, onLogout }: CustomerDashboardHeaderProps) => {
  const { isMobile } = useDeviceType();

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="flex flex-col space-y-4 mt-8">
          <Button variant="outline" asChild className="justify-start">
            <Link to="/tableau-de-bord-client/preferences">
              <Settings className="mr-2 h-4 w-4" />
              Préférences
            </Link>
          </Button>
          <Button onClick={onLogout} variant="outline" className="justify-start">
            Déconnexion
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-wrap gap-4 justify-between items-center'} py-4 mb-8`}>
      <div className={isMobile ? 'text-center' : ''}>
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>Bonjour, {displayName}</h1>
        <p className="text-muted-foreground text-sm">
          {clientCode ? `Code client: ${clientCode}` : email}
        </p>
      </div>
      <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
        {isMobile ? (
          <MobileMenu />
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link to="/tableau-de-bord-client/preferences">
                <Settings />
                <span>Préférences</span>
              </Link>
            </Button>
            <Button onClick={onLogout} variant="outline">Déconnexion</Button>
          </>
        )}
      </div>
    </header>
  );
};

export default CustomerDashboardHeader;
