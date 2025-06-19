
import { useEffect } from 'react';

export const useTouchOptimization = () => {
  useEffect(() => {
    // Améliore la réactivité des interactions tactiles
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      input, textarea, select, button {
        -webkit-user-select: auto;
        -khtml-user-select: auto;
        -moz-user-select: auto;
        -ms-user-select: auto;
        user-select: auto;
      }
      
      button, [role="button"], input[type="submit"], input[type="button"] {
        touch-action: manipulation;
        cursor: pointer;
      }
      
      .touch-pan-y {
        touch-action: pan-y;
      }
      
      .touch-pan-x {
        touch-action: pan-x;
      }
      
      .safe-area-pb {
        padding-bottom: env(safe-area-inset-bottom);
      }
      
      .safe-area-pt {
        padding-top: env(safe-area-inset-top);
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
};
