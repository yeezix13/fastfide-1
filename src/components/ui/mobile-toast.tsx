
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDeviceType } from '@/hooks/useDeviceType';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileToast: React.FC = () => {
  const { toasts, dismiss } = useToast();
  const { isMobile } = useDeviceType();

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dismiss(toast.id);
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, [toasts, dismiss]);

  if (!isMobile || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-[70] pointer-events-none safe-area-top">
      {toasts.map((toast) => {
        const isSuccess = toast.variant !== 'destructive';
        const Icon = isSuccess ? CheckCircle : XCircle;
        
        return (
          <div
            key={toast.id}
            className={`
              mb-3 p-4 rounded-xl shadow-2xl backdrop-blur-sm pointer-events-auto border
              ${isSuccess 
                ? 'bg-green-500/95 text-white border-green-400/50' 
                : 'bg-red-500/95 text-white border-red-400/50'
              }
              animate-in slide-in-from-top-4 duration-300
            `}
          >
            <div className="flex items-start gap-3">
              <Icon className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <div className="font-semibold text-base mb-1">{toast.title}</div>
                )}
                {toast.description && (
                  <div className="text-sm opacity-95 leading-relaxed">{toast.description}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismiss(toast.id)}
                className="h-8 w-8 p-0 hover:bg-white/20 text-white flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MobileToast;
