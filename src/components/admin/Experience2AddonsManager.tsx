/**
 * Experience Pricing Addons Manager
 * 
 * IMPORTANT: Addons represent your COMMISSIONS and TAXES, not the experience price.
 * Final price = HyperGuest price (dynamic based on dates) + Your addons
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Edit2, Loader2, DollarSign } from 'lucide-react';
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
  ADDON_TYPES_EN,
  formatAddonValue,
  getAddonTypeLabelEn,
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
        title: 'Error',
        description: 'Experience ID is missing. Please save the experience first.',
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
          title: 'Success',
          description: 'Pricing rule updated successfully',
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
          title: 'Success',
          description: 'Pricing rule created successfully',
        });
      }
      handleCloseDialog();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Pricing rule deleted successfully',
      });
      setDeleteConfirmId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const watchedType = form.watch('type');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading pricing rules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with explanation */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Final Price = HyperGuest (hotel) + Your Commissions + Taxes</span>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => handleOpenDialog()}
          disabled={disabled || !experienceId}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Pricing Rule
        </Button>
      </div>

      {/* Pricing list */}
      {addons.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg bg-muted/20">
          {experienceId 
            ? 'No pricing rules configured yet. Click "Add Pricing Rule" to set up commissions and taxes.'
            : 'Save the experience as a draft first to configure pricing rules.'
          }
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addons.map((addon) => (
                <TableRow key={addon.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {getAddonTypeLabelEn(addon.type as AddonType)}
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
                      {addon.is_active ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenDialog(addon.id);
                        }}
                        disabled={disabled}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteConfirmId(addon.id);
                        }}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAddonId ? 'Edit Pricing Rule' : 'New Pricing Rule'}
            </DialogTitle>
            <DialogDescription>
              {ADDON_TYPES_EN[watchedType]?.description || 'Configure a commission, fee or tax'}
            </DialogDescription>
          </DialogHeader>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit(onSubmit)(e);
            }} 
            className="space-y-4"
          >
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={form.watch('type')}
                onValueChange={(value) => {
                  form.setValue('type', value as AddonType);
                  form.setValue('calculation_order', getDefaultCalculationOrder(value as AddonType));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ADDON_TYPES_EN).map(([key, { label }]) => (
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

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="e.g. Service Fee, VAT, etc."
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Hebrew Name */}
            <div className="space-y-2">
              <Label htmlFor="name_he">Name (Hebrew)</Label>
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
                placeholder="Optional description"
                rows={2}
              />
            </div>

            {/* Value and type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Value *</Label>
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
                <Label htmlFor="is_percentage">Value Type</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="is_percentage"
                    checked={form.watch('is_percentage')}
                    onCheckedChange={(checked) => form.setValue('is_percentage', checked)}
                  />
                  <Label htmlFor="is_percentage" className="cursor-pointer text-sm">
                    {form.watch('is_percentage') ? 'Percentage (%)' : 'Fixed Amount (₪)'}
                  </Label>
                </div>
              </div>
            </div>

            {/* Calculation Order */}
            <div className="space-y-2">
              <Label htmlFor="calculation_order">Calculation Order</Label>
              <Input
                id="calculation_order"
                type="number"
                min="0"
                {...form.register('calculation_order', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                {watchedType === 'tax'
                  ? 'Taxes are typically applied after commissions (order ≥ 1)'
                  : 'Commissions are applied before taxes (order 0)'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingAddonId ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete pricing rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The pricing rule will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (deleteConfirmId) {
                  handleDelete(deleteConfirmId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
