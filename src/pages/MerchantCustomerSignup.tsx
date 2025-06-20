import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import CustomerSignupForm from '@/components/merchant/CustomerSignupForm';
import CustomerSignupHeader from '@/components/merchant/CustomerSignupHeader';
import { useCustomerSignupByMerchant } from '@/hooks/useCustomerSignupByMerchant';

const MerchantCustomerSignup = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/merchant');
      }
    };
    checkUser();
  }, [navigate]);

  const { data: merchant } = useQuery({
    queryKey: ['merchantDetails', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { signupCustomer, isLoading } = useCustomerSignupByMerchant(merchant);

  const handleSubmit = async (values: any) => {
    const success = await signupCustomer(values);
    if (success) {
      // Réinitialiser le formulaire après succès
      window.location.reload();
    }
  };

  if (!user || !merchant) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  const themeColor = merchant.theme_color || "#6366f1";

  return (
    <>
      <Helmet>
        <title>Inscrire un client - {merchant.name}</title>
      </Helmet>
      <div className="min-h-screen bg-[#f8f9fb] p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/merchant-dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </div>

          <Card className="rounded-2xl shadow-lg border-0">
            <CustomerSignupHeader merchant={merchant} themeColor={themeColor} />
            <CardContent>
              <CustomerSignupForm 
                onSubmit={handleSubmit}
                isLoading={isLoading}
                themeColor={themeColor}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MerchantCustomerSignup;
