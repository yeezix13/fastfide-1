
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0ed36b8647df4baeb33f0c26b4877cf3',
  appName: 'FastFide',
  webDir: 'dist',
  server: {
    url: 'https://0ed36b86-47df-4bae-b33f-0c26b4877cf3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2563eb',
      showSpinner: false
    }
  }
};

export default config;
