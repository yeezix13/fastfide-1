
import { useToast } from '@/hooks/use-toast';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = (
    error: unknown, 
    context: string, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = "Une erreur inattendue s'est produite"
    } = options;

    let errorMessage = fallbackMessage;
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    if (logError) {
      console.error(`[${context}] Erreur:`, error);
    }

    if (showToast) {
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }

    return errorMessage;
  };

  return { handleError };
};
