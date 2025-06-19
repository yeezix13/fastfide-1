
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { useTouchOptimization } from "@/hooks/useTouchOptimization";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MerchantSpace from "./pages/MerchantSpace";
import CustomerSpace from "./pages/CustomerSpace";
import CustomerDashboard from "./pages/CustomerDashboard";
import MerchantDashboard from "./pages/MerchantDashboard";
import CustomerMerchantDetails from "./pages/CustomerMerchantDetails";
import CustomerPreferences from "./pages/CustomerPreferences";
import CustomerVisits from "./pages/CustomerVisits";
import CustomerSignUpPage from "./pages/CustomerSignUpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import MerchantCustomerSignup from "./pages/MerchantCustomerSignup";

const queryClient = new QueryClient();

const AppContent = () => {
  useTouchOptimization();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/connexion-commercant" element={<MerchantSpace />} />
      <Route path="/connexion-client" element={<CustomerSpace />} />
      <Route path="/tableau-de-bord-client" element={<CustomerDashboard />} />
      <Route path="/tableau-de-bord-commercant" element={<MerchantDashboard />} />
      <Route path="/tableau-de-bord-client/commercant/:merchantId" element={<CustomerMerchantDetails />} />
      <Route path="/tableau-de-bord-client/preferences" element={<CustomerPreferences />} />
      <Route path="/tableau-de-bord-commercant/visites-client/:merchantId/:customerId" element={<CustomerVisits />} />
      <Route path="/tableau-de-bord-commercant/inscrire-client" element={<MerchantCustomerSignup />} />
      <Route path="/inscription" element={<CustomerSignUpPage />} />
      <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
