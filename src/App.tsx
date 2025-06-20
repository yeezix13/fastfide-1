
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { HelmetProvider } from "react-helmet-async";
import HomePage from "./pages/HomePage";
import CustomerSpace from "./pages/CustomerSpace";
import MerchantSpace from "./pages/MerchantSpace";
import CustomerDashboard from "./pages/CustomerDashboard";
import MerchantDashboard from "./pages/MerchantDashboard";
import CustomerVisits from "./pages/CustomerVisits";
import CustomerPreferences from "./pages/CustomerPreferences";
import CustomerMerchantDetails from "./pages/CustomerMerchantDetails";
import MerchantCustomerSignup from "./pages/MerchantCustomerSignup";
import CustomerSignUpPage from "./pages/CustomerSignUpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ResetPasswordCustomPage from "./pages/ResetPasswordCustomPage";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import ConfirmEmailCustomPage from "./pages/ConfirmEmailCustomPage";
import NotFound from "./pages/NotFound";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/customer" element={<CustomerSpace />} />
              <Route path="/merchant" element={<MerchantSpace />} />
              <Route path="/customer-dashboard" element={<CustomerDashboard />} />
              <Route path="/merchant-dashboard" element={<MerchantDashboard />} />
              <Route path="/customer-visits" element={<CustomerVisits />} />
              <Route path="/customer-preferences" element={<CustomerPreferences />} />
              <Route path="/customer-merchant/:merchantId" element={<CustomerMerchantDetails />} />
              <Route path="/merchant-customer-signup" element={<MerchantCustomerSignup />} />
              <Route path="/merchant-dashboard/register-customer" element={<MerchantCustomerSignup />} />
              <Route path="/merchant-dashboard/customer-visits/:merchantId/:customerId" element={<CustomerVisits />} />
              <Route path="/customer-signup" element={<CustomerSignUpPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/reset-password-custom" element={<ResetPasswordCustomPage />} />
              <Route path="/confirm-email" element={<ConfirmEmailCustomPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
