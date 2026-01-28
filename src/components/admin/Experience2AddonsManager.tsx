/**
 * Composant pour gérer les ajouts d'expérience dans le formulaire admin
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useExperienceAddons,
  useCreateExperienceAddon,
  useUpdateExperienceAddon,
  useDeleteExperienceAddon,
} from '@/hooks/useExperience2Addons';
import {
  addonFormSchema,
  type AddonFormSchemaData,
} from '@/schemas/experience2_addon_validation';
import {
  ADDON_TYPES,
  formatAddonValue,
  getAddonTypeLabel,
  getDefaultCalculationOrder,
  type AddonType,
} from '@/types/experience2_addons';

interface Experience2AddonsManagerProps {
  experienceId: string | null;
  disabled?: boolean;
}

export function Experience2AddonsManager({
  experienceId,
  disabled = false,
}: Experience2AddonsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { toast } = useToast();
  const { data: addons = [], isLoading } = useExperienceAddons(experienceId);
  const createMutation = useCreateExperienceAddon();
  const updateMutation = useUpdateExperienceAddon();
  const deleteMutation = useDeleteExperienceAddon();

  const form = useForm<AddonFormSchemaData>({
    resolver: zodResolver(addonFormSchema),
    defaultValues: {
      type: 'commission',
      name: '',
      name_he: '',
      description: '',
      description_he: '',
      value: 0,
      is_percentage: false,
      calculation_order: 0,
    },
  });

  const handleOpenDialog = (addonId?: string) => {
    if (addonId) {
      const addon = addons.find((a) => a.id === addonId);
      if (addon) {
        setEditingAddonId(addonId);
        form.reset({
          type: addon.type as AddonType,
          name: addon.name,
          name_he: addon.name_he || '',
          description: addon.description || '',
          description_he: addon.description_he || '',
          value: Number(addon.value),
          is_percentage: addon.is_percentage ?? false,
          calculation_order: addon.calculation_order ?? 0,
        });
      }
    } else {
      setEditingAddonId(null);
      form.reset({
        type: 'commission',
        name: '',
        name_he: '',
        description: '',
        description_he: '',
        value: 0,
        is_percentage: false,
        calculation_order: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddonId(null);
    form.reset();
  };

  const onSubmit = async (data: AddonFormSchemaData) => {
    if (!experienceId) {
      toast({
        title: 'Erreur',
        description: 'ID d\'expérience manquant',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingAddonId) {
        await updateMutation.mutateAsync({
          id: editingAddonId,
          updates: {
            type: data.type,
            name: data.name,
            name_he: data.name_he,
            description: data.description,
            description_he: data.description_he,
            value: data.value,
            is_percentage: data.is_percentage,
            calculation_order: data.calculation_order,
          },
        });
        toast({
          title: 'Succès',
          description: 'Ajout modifié avec succès',
        });
      } else {
        await createMutation.mutateAsync({
          type: data.type,
          name: data.name,
          name_he: data.name_he,
          description: data.description,
          description_he: data.description_he,
          value: data.value,
          is_percentage: data.is_percentage,
          calculation_order: data.calculation_order,
          experience_id: experienceId,
        });
        toast({
          title: 'Succès',
          description: 'Ajout créé avec succès',
        });
      }
      handleCloseDialog();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Succès',
        description: 'Ajout supprimé avec succès',
      });
      setDeleteConfirmId(null);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    }
  };

  // Mettre à jour l'ordre de calcul par défaut quand le type change
  const watchedType = form.watch('type');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Chargement des ajouts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Ajouts de prix</h3>
          <p className="text-sm text-muted-foreground">
            Configurez les commissions, prix par nuit et taxes pour cette expérience
          </p>
        </div>
        <Button
          type="button"
          onClick={() => handleOpenDialog()}
          disabled={disabled || !experienceId}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un ajout
        </Button>
      </div>

      {/* Liste des ajouts */}
      {addons.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg bg-muted/20">
          {experienceId 
            ? 'Aucun ajout configuré. Cliquez sur "Ajouter un ajout" pour commencer.'
            : 'Sauvegardez l\'expérience d\'abord pour pouvoir ajouter des ajouts de prix.'
          }
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead>Actif</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addons.map((addon) => (
                <TableRow key={addon.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {getAddonTypeLabel(addon.type as AddonType)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{addon.name}</div>
                      {addon.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {addon.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {formatAddonValue(addon)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{addon.calculation_order}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={addon.is_active ? 'default' : 'secondary'}>
                      {addon.is_active ? 'Oui' : 'Non'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(addon.id)}
                        disabled={disabled}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirmId(addon.id)}
                        disabled={disabled}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog de création/modification */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddonId ? 'Modifier l\'ajout' : 'Nouvel ajout'}
            </DialogTitle>
            <DialogDescription>
              {ADDON_TYPES[watchedType]?.description}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type d'ajout *</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(value) => {
                  form.setValue('type', value as AddonType);
                  form.setValue('calculation_order', getDefaultCalculationOrder(value as AddonType));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ADDON_TYPES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.type.message}
                </p>
              )}
            </div>

            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Ex: Commission de service"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Nom hébreu */}
            <div className="space-y-2">
              <Label htmlFor="name_he">Nom (hébreu)</Label>
              <Input
                id="name_he"
                {...form.register('name_he')}
                placeholder="שם בעברית"
                dir="rtl"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Description optionnelle de l'ajout"
                rows={2}
              />
            </div>

            {/* Valeur et type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Valeur *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  {...form.register('value', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {form.formState.errors.value && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.value.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_percentage">Type de valeur</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="is_percentage"
                    checked={form.watch('is_percentage')}
                    onCheckedChange={(checked) => form.setValue('is_percentage', checked)}
                  />
                  <Label htmlFor="is_percentage" className="cursor-pointer text-sm">
                    {form.watch('is_percentage') ? 'Pourcentage (%)' : 'Montant fixe (€)'}
                  </Label>
                </div>
              </div>
            </div>

            {/* Ordre de calcul */}
            <div className="space-y-2">
              <Label htmlFor="calculation_order">Ordre de calcul</Label>
              <Input
                id="calculation_order"
                type="number"
                min="0"
                {...form.register('calculation_order', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                {watchedType === 'tax'
                  ? 'Les taxes s\'appliquent généralement après les commissions (ordre ≥ 1)'
                  : 'Les commissions s\'appliquent avant les taxes (ordre 0)'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingAddonId ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'ajout ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'ajout sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
