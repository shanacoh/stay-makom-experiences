/**
 * Experience Pricing Addons Manager
 *
 * - Addons = commissions and taxes. Final price = HyperGuest price + Your addons.
 * - Create experience: one section with all 3 types (commission, per night, tax) inline; parent reads values on submit.
 * - Existing experience, no add-ons yet: one button opens one form with all 3 types; save creates the 3 at once.
 * - Existing add-ons: table with edit/delete per row.
 */

import { useState, useImperativeHandle, forwardRef } from "react";
import { Plus, Trash2, Edit2, Loader2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useExperienceAddons,
  useCreateExperienceAddon,
  useCreateAddonsWithValues,
  useUpdateExperienceAddon,
  useDeleteExperienceAddon,
} from "@/hooks/useExperience2Addons";
import {
  ADDON_TYPES_EN,
  formatAddonValue,
  getAddonTypeLabelEn,
  getDefaultDraftAddons,
  type AddonType,
  type AddonFormData,
  type ExperienceAddon,
} from "@/types/experience2_addons";

const ADDON_TYPES_ORDER: AddonType[] = ["commission", "per_night", "tax"];

interface Experience2AddonsManagerProps {
  experienceId: string | null;
  disabled?: boolean;
  /** When creating experience: controlled list of the 3 add-ons. Parent uses getDefaultDraftAddons() and reads on submit. */
  addonsForCreate?: AddonFormData[];
  onAddonsForCreateChange?: (addons: AddonFormData[]) => void;
}

export const Experience2AddonsManager = forwardRef<
  { getAddonsForCreate: () => AddonFormData[] },
  Experience2AddonsManagerProps
>(function Experience2AddonsManager(
  { experienceId, disabled = false, addonsForCreate: addonsForCreateProp, onAddonsForCreateChange },
  ref,
) {
  const [isAddAllDialogOpen, setIsAddAllDialogOpen] = useState(false);
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [addAllFormValues, setAddAllFormValues] = useState<AddonFormData[]>(() => getDefaultDraftAddons());
  const [editFormValues, setEditFormValues] = useState<AddonFormData | null>(null);
  const [internalAddons, setInternalAddons] = useState<AddonFormData[]>(() => getDefaultDraftAddons());

  const { toast } = useToast();
  const { data: addons = [], isLoading } = useExperienceAddons(experienceId);
  const createMutation = useCreateExperienceAddon();
  const createWithValuesMutation = useCreateAddonsWithValues();
  const updateMutation = useUpdateExperienceAddon();
  const deleteMutation = useDeleteExperienceAddon();

  const isCreateFlow = experienceId === null;
  const addonsForCreate = addonsForCreateProp ?? internalAddons;
  const setAddonsForCreate = onAddonsForCreateChange ?? setInternalAddons;

  useImperativeHandle(
    ref,
    () => ({
      getAddonsForCreate: () => addonsForCreateProp ?? internalAddons,
    }),
    [addonsForCreateProp, internalAddons],
  );

  const updateCreateAddon = (index: number, patch: Partial<AddonFormData>) => {
    const next = [...addonsForCreate];
    next[index] = { ...next[index], ...patch };
    setAddonsForCreate(next);
  };

  const handleOpenAddAllDialog = () => {
    setAddAllFormValues(getDefaultDraftAddons());
    setIsAddAllDialogOpen(true);
  };

  const handleSaveAddAll = async () => {
    if (!experienceId) return;
    try {
      await createWithValuesMutation.mutateAsync({ experienceId, addons: addAllFormValues });
      toast({
        title: "Success",
        description: "Pricing rules (commission, per night, tax) created.",
      });
      setIsAddAllDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create pricing rules",
        variant: "destructive",
      });
    }
  };

  const handleOpenEdit = (addon: ExperienceAddon) => {
    setEditingAddonId(addon.id);
    setEditFormValues({
      type: addon.type as AddonType,
      name: addon.name,
      name_he: addon.name_he ?? undefined,
      description: addon.description ?? undefined,
      description_he: addon.description_he ?? undefined,
      value: Number(addon.value),
      is_percentage: addon.is_percentage ?? false,
      calculation_order: addon.calculation_order ?? 0,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingAddonId || !editFormValues) return;
    try {
      await updateMutation.mutateAsync({
        id: editingAddonId,
        updates: editFormValues,
      });
      toast({ title: "Success", description: "Pricing rule updated." });
      setEditingAddonId(null);
      setEditFormValues(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Update failed",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Success", description: "Pricing rule deleted." });
      setDeleteConfirmId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Delete failed",
        variant: "destructive",
      });
    }
  };

  if (!isCreateFlow && isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading pricing rules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <DollarSign className="h-4 w-4" />
        <span>Final Price = HyperGuest (hotel) + Your Commissions + Taxes</span>
      </div>

      {/* Create experience: all 3 types inline, no dialog */}
      {isCreateFlow && (
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="text-sm font-medium">Pricing rules (commission, per night, tax)</h4>
          <p className="text-xs text-muted-foreground">
            Fill in the 3 rules below. They will be saved when you create the experience.
          </p>
          <div className="space-y-4">
            {ADDON_TYPES_ORDER.map((type, index) => {
              const addon = addonsForCreate[index] ?? getDefaultDraftAddons()[index];
              if (!addon) return null;
              return (
                <div
                  key={type}
                  className="grid gap-3 rounded-md border bg-muted/30 p-3 sm:grid-cols-[120px_1fr_100px_80px_60px]"
                >
                  <div className="flex items-center">
                    <Badge variant="outline">{getAddonTypeLabelEn(type)}</Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      placeholder="e.g. Service fee"
                      value={addon.name}
                      onChange={(e) => updateCreateAddon(index, { name: e.target.value })}
                      disabled={disabled}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Value</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={addon.value}
                      onChange={(e) => updateCreateAddon(index, { value: parseFloat(e.target.value) || 0 })}
                      disabled={disabled}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={addon.is_percentage}
                      onCheckedChange={(checked) => updateCreateAddon(index, { is_percentage: checked })}
                      disabled={disabled}
                    />
                    <Label className="text-xs">%</Label>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Order</Label>
                    <Input
                      type="number"
                      min={0}
                      value={addon.calculation_order}
                      onChange={(e) =>
                        updateCreateAddon(index, {
                          calculation_order: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      disabled={disabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Existing experience: no add-ons → one button, one dialog with all 3 types */}
      {!isCreateFlow && addons.length === 0 && (
        <>
          <Button type="button" onClick={handleOpenAddAllDialog} disabled={disabled} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add pricing rules (all 3 types at once)
          </Button>

          <Dialog open={isAddAllDialogOpen} onOpenChange={setIsAddAllDialogOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Set up commissions & taxes</DialogTitle>
                <DialogDescription>
                  Fill in the 3 rules below. One save creates commission, per night fee and tax.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {ADDON_TYPES_ORDER.map((type, index) => {
                  const a = addAllFormValues[index];
                  if (!a) return null;
                  return (
                    <div key={type} className="space-y-2 rounded-md border p-3">
                      <Badge variant="secondary">{getAddonTypeLabelEn(type)}</Badge>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Name</Label>
                          <Input
                            value={a.name}
                            onChange={(e) => {
                              const next = [...addAllFormValues];
                              next[index] = { ...next[index], name: e.target.value };
                              setAddAllFormValues(next);
                            }}
                            placeholder="e.g. Service fee"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Value</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={a.value}
                            onChange={(e) => {
                              const next = [...addAllFormValues];
                              next[index] = {
                                ...next[index],
                                value: parseFloat(e.target.value) || 0,
                              };
                              setAddAllFormValues(next);
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={a.is_percentage}
                          onCheckedChange={(checked) => {
                            const next = [...addAllFormValues];
                            next[index] = { ...next[index], is_percentage: checked };
                            setAddAllFormValues(next);
                          }}
                        />
                        <Label className="text-xs">Percentage (%)</Label>
                        <span className="ml-2 text-xs text-muted-foreground">Order</span>
                        <Input
                          type="number"
                          min={0}
                          className="w-16"
                          value={a.calculation_order}
                          onChange={(e) => {
                            const next = [...addAllFormValues];
                            next[index] = {
                              ...next[index],
                              calculation_order: parseInt(e.target.value, 10) || 0,
                            };
                            setAddAllFormValues(next);
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddAllDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveAddAll} disabled={createWithValuesMutation.isPending}>
                  {createWithValuesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save all 3 rules
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Existing experience: has add-ons → table + edit/delete */}
      {!isCreateFlow && addons.length > 0 && (
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
                    <Badge variant="outline">{getAddonTypeLabelEn(addon.type as AddonType)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{addon.name}</div>
                    {addon.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">{addon.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{formatAddonValue(addon)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{addon.calculation_order}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={addon.is_active ? "default" : "secondary"}>{addon.is_active ? "Yes" : "No"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(addon)}
                        disabled={disabled}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
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

      {/* Edit single addon dialog */}
      <Dialog
        open={editingAddonId !== null}
        onOpenChange={(open) => !open && (setEditingAddonId(null), setEditFormValues(null))}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Edit pricing rule</DialogTitle>
          </DialogHeader>
          {editFormValues && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editFormValues.name}
                  onChange={(e) => setEditFormValues({ ...editFormValues, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormValues.value}
                    onChange={(e) =>
                      setEditFormValues({
                        ...editFormValues,
                        value: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <Switch
                    checked={editFormValues.is_percentage}
                    onCheckedChange={(checked) => setEditFormValues({ ...editFormValues, is_percentage: checked })}
                  />
                  <Label className="text-sm">%</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  min={0}
                  value={editFormValues.calculation_order}
                  onChange={(e) =>
                    setEditFormValues({
                      ...editFormValues,
                      calculation_order: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => (setEditingAddonId(null), setEditFormValues(null))}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete pricing rule?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});
