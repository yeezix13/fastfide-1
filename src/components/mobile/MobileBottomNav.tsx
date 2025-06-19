
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Store, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  userType: 'customer' | 'merchant';
  themeColor?: string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ userType, themeColor = '#2563eb' }) => {
  const location = useLocation();
  
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-2 px-4 rounded-lg transition-colors",
                isActive 
                  ? "text-white" 
                  : "text-gray-500 hover:text-gray-700"
              )}
              style={isActive ? { backgroundColor: themeColor } : {}}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
