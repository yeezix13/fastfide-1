
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeviceType } from '@/hooks/useDeviceType';

interface MobileBackButtonProps {
  to?: string;
  className?: string;
  children?: React.ReactNode;
}

const MobileBackButton: React.FC<MobileBackButtonProps> = ({ 
  to, 
  className = "", 
  children = "Retour" 
}) => {
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  if (isMobile) {
    return (
      <div className="fixed top-16 left-4 z-[60] safe-area-top">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClick}
          className={`bg-white/95 backdrop-blur-sm border-gray-300 shadow-lg px-3 py-2 min-h-[40px] text-sm ${className}`}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span className="font-medium">{children}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <Button variant="outline" onClick={handleClick}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {children}
      </Button>
    </div>
  );
};

export default MobileBackButton;
