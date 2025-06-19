
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, User, Settings, Store, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileBottomNavProps {
  userType: 'customer' | 'merchant';
  themeColor?: string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ userType, themeColor = '#2563eb' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };

  const customerNavItems = [
    { icon: Home, label: 'Accueil', path: '/tableau-de-bord-client' },
    { icon: Settings, label: 'Préférences', path: '/tableau-de-bord-client/preferences' },
  ];

  const merchantNavItems = [
    { icon: Home, label: 'Accueil', path: '/tableau-de-bord-commercant' },
    { icon: User, label: 'Inscrire', path: '/tableau-de-bord-commercant/inscrire-client' },
  ];

  const navItems = userType === 'customer' ? customerNavItems : merchantNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex justify-around items-center py-1 px-1">
        {/* Bouton Retour */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex flex-col items-center py-2 px-2 rounded-lg transition-colors min-h-[44px] text-xs"
        >
          <ArrowLeft className="h-4 w-4 mb-0.5 text-gray-600" />
          <span className="text-xs font-medium text-gray-600">Retour</span>
        </Button>

        {/* Navigation items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-2 px-2 rounded-lg transition-colors min-h-[44px]",
                isActive 
                  ? "text-white" 
                  : "text-gray-500 hover:text-gray-700"
              )}
              style={isActive ? { backgroundColor: themeColor } : {}}
            >
              <Icon className="h-4 w-4 mb-0.5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Bouton Stats/Actions pour merchant */}
        {userType === 'merchant' && (
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center py-2 px-2 rounded-lg transition-colors min-h-[44px] text-xs"
            style={{ color: themeColor }}
          >
            <BarChart3 className="h-4 w-4 mb-0.5" />
            <span className="text-xs font-medium">Stats</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileBottomNav;
