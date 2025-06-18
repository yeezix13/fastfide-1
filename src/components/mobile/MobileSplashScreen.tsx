
import React from 'react';
import { Store } from 'lucide-react';

const MobileSplashScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-primary-foreground">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/9c24c620-d700-43f2-bb91-b498726fd2ff.png" 
            alt="FastFide" 
            className="h-32 w-auto"
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">FastFide</h1>
          <p className="text-lg opacity-90">Votre fidélité récompensée</p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  );
};

export default MobileSplashScreen;
