
import React, { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDeviceType } from '@/hooks/useDeviceType';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MobileToast: React.FC = () => {
  const { toasts, dismiss } = useToast();
  const { isMobile } = useDeviceType();
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Auto-dismiss toasts after 3 seconds
  useEffect(() => {
    toasts.forEach((toast) => {
      if (!toast.id || timersRef.current.has(toast.id)) return;
      
      const timer = setTimeout(() => {
        dismiss(toast.id);
        timersRef.current.delete(toast.id);
      }, 3000);

      timersRef.current.set(toast.id, timer);
    });

    // Cleanup timers for toasts that no longer exist
    timersRef.current.forEach((timer, toastId) => {
      if (!toasts.find(t => t.id === toastId)) {
        clearTimeout(timer);
        timersRef.current.delete(toastId);
      }
    });

    // Cleanup all timers when component unmounts
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [toasts, dismiss]);

  if (!isMobile || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-[80] pointer-events-none safe-area-top">
      {toasts.map((toast) => {
        const isSuccess = toast.variant !== 'destructive';
        const Icon = isSuccess ? CheckCircle : XCircle;
        
        return (
          <div
            key={toast.id}
            className={`
              mb-3 p-3 rounded-lg shadow-xl backdrop-blur-sm pointer-events-auto border
              ${isSuccess 
                ? 'bg-green-500/95 text-white border-green-400/50' 
                : 'bg-red-500/95 text-white border-red-400/50'
              }
              animate-in slide-in-from-top-4 duration-300
            `}
          >
            <div className="flex items-start gap-2">
              <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <div className="font-semibold text-sm mb-1">{toast.title}</div>
                )}
                {toast.description && (
                  <div className="text-xs opacity-95 leading-relaxed">{toast.description}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Clear the timer when manually dismissed
                  const timer = timersRef.current.get(toast.id);
                  if (timer) {
                    clearTimeout(timer);
                    timersRef.current.delete(toast.id);
                  }
                  dismiss(toast.id);
                }}
                className="h-6 w-6 p-0 hover:bg-white/20 text-white flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MobileToast;
