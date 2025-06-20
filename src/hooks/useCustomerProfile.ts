
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useErrorHandler } from './useErrorHandler';
import type { User } from '@supabase/supabase-js';
import type { ProfileFormValues } from '@/components/customer/CustomerPreferencesForm';

export const useCustomerProfile = () => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/connexion-client');
      } else {
        setUser(session.user);
      }
    };
    getUser();
  }, [navigate]);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, birth_date, client_code, email, rgpd_consent, marketing_consent')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        handleError(error, "Profile fetch", { showToast: false });
      }
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!user) throw new Error("Utilisateur non authentifié.");

      // Convertir la date de JJ/MM/AAAA vers YYYY-MM-DD
      let formattedBirthDate = null;
      if (data.birth_date && data.birth_date.trim() !== '') {
        const [day, month, year] = data.birth_date.split('/');
        formattedBirthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          birth_date: formattedBirthDate,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      if (data.email && data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: data.email });
        if (emailError) throw emailError;
      }
    },
    onSuccess: () => {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error: any) => {
      handleError(error, "Profile update", {
        fallbackMessage: "Une erreur est survenue lors de la mise à jour."
      });
    },
  });

  return {
    user,
    profile,
    isLoadingProfile,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};
