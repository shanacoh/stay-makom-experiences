// =============================================================================
// src/components/admin/Experience2AddonsManager.tsx
// Gestionnaire d'addons par personne — V2
//
// Supporte deux modes :
//   - Mode DB (experienceId fourni) : CRUD direct dans experience2_addons
//   - Mode local (pas d'experienceId) : gère les addons en mémoire,
//     le parent les sauvegarde après création de l'expérience
// =============================================================================

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ExperienceAddon } from "@/types/experience2_addons";

// ---------------------------------------------------------------------------
// Local addon type (used when no experienceId yet)
// ---------------------------------------------------------------------------

export interface LocalAddonEntry {
  id: string; // temp UUID locally, real UUID from DB
  name: string;
  name_he: string | null;
  value: number;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Experience2AddonsManagerProps {
  /** Si fourni, les addons sont lus/écrits directement en base */
  experienceId: string | null | undefined;
  disabled?: boolean;
  /** Addons en mémoire locale (mode création, avant que l'expérience soit sauvegardée) */
  localAddons?: LocalAddonEntry[];
  /** Callback quand les addons locaux changent */
  onLocalAddonsChange?: (addons: LocalAddonEntry[]) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Experience2AddonsManager({
  experienceId,
  disabled = false,
  localAddons = [],
  onLocalAddonsChange,
}: Experience2AddonsManagerProps) {
  const queryClient = useQueryClient();
  const isLocalMode = !experienceId;

  // ─── State: new addon form ───
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonNameHe, setNewAddonNameHe] = useState("");
  const [newAddonValue, setNewAddonValue] = useState<number>(0);
  const [deleteAddonId, setDeleteAddonId] = useState<string | null>(null);

  // ─── Query: fetch addons from DB (only when experienceId exists) ───
  const { data: dbAddons, isLoading: isLoadingAddons } = useQuery({
    queryKey: ["experience2-addons", experienceId],
    queryFn: async () => {
      if (!experienceId) return [];
      const { data, error } = await supabase
        .from("experience2_addons")
        .select("*")
        .eq("experience_id", experienceId)
        .order("calculation_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ExperienceAddon[];
    },
    enabled: !!experienceId,
  });

  // Sync DB addons → local addons when they load (so parent always has the list)
  useEffect(() => {
    if (dbAddons && !isLocalMode && onLocalAddonsChange) {
      const synced: LocalAddonEntry[] = dbAddons
        .filter((a) => a.type === "per_person")
        .map((a) => ({
          id: a.id,
          name: a.name,
          name_he: a.name_he ?? null,
          value: a.value,
          is_active: a.is_active,
        }));
      onLocalAddonsChange(synced);
    }
  }, [dbAddons, isLocalMode]);

  // ─── Mutations: DB mode ───

  const addAddonMutation = useMutation({
    mutationFn: async () => {
      if (!experienceId) throw new Error("No experience ID");
      const maxOrder = (dbAddons ?? []).reduce((m, a) => Math.max(m, a.calculation_order), 0);
      const { error } = await supabase.from("experience2_addons").insert({
        experience_id: experienceId,
        type: "per_person" as const,
        name: newAddonName.trim(),
        name_he: newAddonNameHe.trim() || null,
        value: newAddonValue,
        is_percentage: false,
        calculation_order: maxOrder + 1,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Addon ajouté");
      resetNewForm();
      queryClient.invalidateQueries({
        queryKey: ["experience2-addons", experienceId],
      });
    },
    onError: (err: any) => toast.error(err.message || "Erreur lors de l'ajout"),
  });

  const toggleAddonMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from("experience2_addons").update({ is_active: isActive }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["experience2-addons", experienceId],
      });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteAddonMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("experience2_addons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Addon supprimé");
      setDeleteAddonId(null);
      queryClient.invalidateQueries({
        queryKey: ["experience2-addons", experienceId],
      });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // ─── Local mode helpers ───

  function resetNewForm() {
    setNewAddonName("");
    setNewAddonNameHe("");
    setNewAddonValue(0);
  }

  function handleAddLocal() {
    if (!newAddonName.trim() || newAddonValue <= 0) return;
    const newEntry: LocalAddonEntry = {
      id: crypto.randomUUID(),
      name: newAddonName.trim(),
      name_he: newAddonNameHe.trim() || null,
      value: newAddonValue,
      is_active: true,
    };
    onLocalAddonsChange?.([...localAddons, newEntry]);
    resetNewForm();
  }

  function handleToggleLocal(id: string, isActive: boolean) {
    onLocalAddonsChange?.(localAddons.map((a) => (a.id === id ? { ...a, is_active: isActive } : a)));
  }

  function handleDeleteLocal(id: string) {
    onLocalAddonsChange?.(localAddons.filter((a) => a.id !== id));
    setDeleteAddonId(null);
  }

  // ─── Resolved addons list ───

  const perPersonAddons: LocalAddonEntry[] = isLocalMode
    ? localAddons
    : (dbAddons ?? [])
        .filter((a) => a.type === "per_person")
        .map((a) => ({
          id: a.id,
          name: a.name,
          name_he: a.name_he ?? null,
          value: a.value,
          is_active: a.is_active,
        }));

  // ─── Handlers (dispatch to local or DB mode) ───

  function handleAdd() {
    if (isLocalMode) {
      handleAddLocal();
    } else {
      addAddonMutation.mutate();
    }
  }

  function handleToggle(id: string, isActive: boolean) {
    if (isLocalMode) {
      handleToggleLocal(id, isActive);
    } else {
      toggleAddonMutation.mutate({ id, isActive });
    }
  }

  function handleDelete(id: string) {
    if (isLocalMode) {
      handleDeleteLocal(id);
    } else {
      deleteAddonMutation.mutate(id);
    }
  }

  // ─── Loading ───

  if (!isLocalMode && isLoadingAddons) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // ─── Render ───

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            Addons par personne
          </CardTitle>
          <CardDescription>Prestations facturées par voyageur (petit-déjeuner, massage, activités…)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing addons list */}
          {perPersonAddons.length > 0 && (
            <div className="space-y-2">
              {perPersonAddons.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-md border bg-muted/30"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Switch
                      checked={addon.is_active}
                      onCheckedChange={(checked) => handleToggle(addon.id, checked)}
                      disabled={disabled}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{addon.name}</p>
                      {addon.name_he && (
                        <p className="text-xs text-muted-foreground truncate" dir="rtl">
                          {addon.name_he}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={addon.is_active ? "default" : "secondary"}>${addon.value} / pers.</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteAddonId(addon.id)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {perPersonAddons.length === 0 && (
            <p className="text-sm text-muted-foreground italic">Aucun addon par personne configuré.</p>
          )}

          {/* Add new addon form */}
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-1">
              <Label htmlFor="addon-name" className="text-xs">
                Nom (EN) *
              </Label>
              <Input
                id="addon-name"
                value={newAddonName}
                onChange={(e) => setNewAddonName(e.target.value)}
                placeholder="Breakfast"
                disabled={disabled}
              />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="addon-name-he" className="text-xs">
                Nom (HE)
              </Label>
              <Input
                id="addon-name-he"
                value={newAddonNameHe}
                onChange={(e) => setNewAddonNameHe(e.target.value)}
                placeholder="ארוחת בוקר"
                dir="rtl"
                disabled={disabled}
              />
            </div>
            <div className="sm:col-span-1">
              <Label htmlFor="addon-value" className="text-xs">
                Prix / personne ($) *
              </Label>
              <Input
                id="addon-value"
                type="number"
                min="0"
                step="0.01"
                value={newAddonValue || ""}
                onChange={(e) => setNewAddonValue(parseFloat(e.target.value) || 0)}
                placeholder="10"
                disabled={disabled}
              />
            </div>
            <div className="sm:col-span-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleAdd}
                disabled={
                  disabled || !newAddonName.trim() || newAddonValue <= 0 || (!isLocalMode && addAddonMutation.isPending)
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteAddonId} onOpenChange={() => setDeleteAddonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet addon ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'addon sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAddonId && handleDelete(deleteAddonId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
