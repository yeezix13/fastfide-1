
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Merchant = Database['public']['Tables']['merchants']['Row'];

interface LogoUploadProps {
  merchant: Merchant;
}

const LogoUpload = ({ merchant }: LogoUploadProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const updateLogoMutation = useMutation({
    mutationFn: async (logoUrl: string | null) => {
      const { error } = await supabase
        .from('merchants')
        .update({ logo_url: logoUrl })
        .eq('id', merchant.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchantDetails', merchant.user_id] });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erreur',
          description: 'Le fichier est trop volumineux. Taille maximale: 5MB.',
          variant: 'destructive',
        });
        return;
      }
      
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erreur',
          description: 'Veuillez sélectionner un fichier image.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Supprimer l'ancien logo s'il existe
      if (merchant.logo_url) {
        const oldPath = merchant.logo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('merchant-logos')
            .remove([`${merchant.id}/${oldPath}`]);
        }
      }

      // Générer un nom de fichier unique
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${merchant.id}/${fileName}`;

      // Télécharger le nouveau fichier
      const { error: uploadError } = await supabase.storage
        .from('merchant-logos')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data } = supabase.storage
        .from('merchant-logos')
        .getPublicUrl(filePath);

      // Mettre à jour la base de données
      await updateLogoMutation.mutateAsync(data.publicUrl);

      toast({
        title: 'Succès',
        description: 'Logo téléchargé avec succès !',
      });

      setSelectedFile(null);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de télécharger le logo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!merchant.logo_url) return;

    try {
      // Supprimer le fichier du storage
      const oldPath = merchant.logo_url.split('/').pop();
      if (oldPath) {
        await supabase.storage
          .from('merchant-logos')
          .remove([`${merchant.id}/${oldPath}`]);
      }

      // Mettre à jour la base de données
      await updateLogoMutation.mutateAsync(null);

      toast({
        title: 'Succès',
        description: 'Logo supprimé avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le logo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Logo du commerce</Label>
        {merchant.logo_url && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveLogo}
            disabled={updateLogoMutation.isPending}
          >
            <X className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        )}
      </div>

      {merchant.logo_url && (
        <div className="flex justify-center mb-4">
          <img
            src={merchant.logo_url}
            alt="Logo actuel"
            className="max-w-32 max-h-32 object-contain border rounded-lg"
          />
        </div>
      )}

      <div className="space-y-2">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <p className="text-sm text-muted-foreground">
          Formats acceptés: JPG, PNG, GIF. Taille maximale: 5MB.
        </p>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm">{selectedFile.name}</span>
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Téléchargement...' : 'Télécharger'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default LogoUpload;
