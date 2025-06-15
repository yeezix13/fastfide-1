
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import type { User } from '@supabase/supabase-js';
import type { ProfileFormValues } from '@/components/customer/CustomerPreferencesForm';

export const useCustomerProfile = () => {
  const { toast } = useToast();
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
        .select('first_name, last_name, phone, birth_date')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
      }
      return data;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!user) throw new Error("Utilisateur non authentifié.");

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          birth_date: data.birth_date ? format(data.birth_date, 'yyyy-MM-dd') : null,
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
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
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
