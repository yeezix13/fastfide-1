
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import HomePage from "./pages/HomePage";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Page d'accueil */}
            <Route path="/" element={<HomePage />} />
            
            {/* Main entry points */}
            <Route path="/merchant" element={<MerchantSpace />} />
            <Route path="/customer" element={<CustomerSpace />} />
            
            {/* Customer routes */}
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/customer-dashboard/merchant/:merchantId" element={<CustomerMerchantDetails />} />
            <Route path="/customer-dashboard/preferences" element={<CustomerPreferences />} />
            <Route path="/customer-signup" element={<CustomerSignUpPage />} />
            
            {/* Merchant routes */}
            <Route path="/merchant-dashboard" element={<MerchantDashboard />} />
            <Route path="/merchant-dashboard/customer-visits/:merchantId/:customerId" element={<CustomerVisits />} />
            <Route path="/merchant-dashboard/register-customer" element={<MerchantCustomerSignup />} />
            
            {/* Auth routes - FIXED: Added the missing route */}
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
