
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDeviceType } from '@/hooks/useDeviceType';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const MobileToast: React.FC = () => {
  const { toasts } = useToast();
  const { isMobile } = useDeviceType();

  if (!isMobile || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.variant !== 'destructive';
        const Icon = isSuccess ? CheckCircle : XCircle;
        
        return (
          <div
            key={toast.id}
            className={`
              mb-2 p-4 rounded-lg shadow-lg backdrop-blur-sm pointer-events-auto
              ${isSuccess 
                ? 'bg-green-500/90 text-white' 
                : 'bg-red-500/90 text-white'
              }
              animate-in slide-in-from-top-2 duration-300
            `}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1">
                {toast.title && (
                  <div className="font-semibold text-sm">{toast.title}</div>
                )}
                {toast.description && (
                  <div className="text-sm opacity-90">{toast.description}</div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MobileToast;
