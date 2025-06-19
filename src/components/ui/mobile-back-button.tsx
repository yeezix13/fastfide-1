
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
      <div className="fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClick}
          className={`bg-white/90 backdrop-blur-sm border-gray-300 shadow-lg ${className}`}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {children}
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
