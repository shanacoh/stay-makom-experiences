// =============================================================================
// src/components/admin/Experience2AddonsManager.tsx
// Gestionnaire d'addons et pricing V2 — 3 sections :
//   A. Addons par personne (CRUD depuis experience2_addons)
//   B. Commissions & Taxe (colonnes experiences2)
//   C. Promo (colonnes experiences2)
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Plus, Trash2, Users, Percent, Tag, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { ExperienceAddon, PricingConfig, PromoType } from "@/types/experience2_addons";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Experience2AddonsManagerProps {
  experienceId: string | null | undefined;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Experience2AddonsManager({ experienceId, disabled = false }: Experience2AddonsManagerProps) {
  const queryClient = useQueryClient();

  // ─── State: per-person addons ───
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonNameHe, setNewAddonNameHe] = useState("");
  const [newAddonValue, setNewAddonValue] = useState<number>(0);
  const [deleteAddonId, setDeleteAddonId] = useState<string | null>(null);

  // ─── State: pricing config ───
  const [commissionRoomPct, setCommissionRoomPct] = useState(0);
  const [commissionAddonsPct, setCommissionAddonsPct] = useState(0);
  const [taxPct, setTaxPct] = useState(0);
  const [promoType, setPromoType] = useState<PromoType | "none">("none");
  const [promoValue, setPromoValue] = useState<number>(0);
  const [promoIsPercentage, setPromoIsPercentage] = useState(true);
  const [configDirty, setConfigDirty] = useState(false);

  // ─── Query: fetch addons ───
  const { data: addons, isLoading: isLoadingAddons } = useQuery({
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

  // ─── Query: fetch pricing config ───
  const { data: pricingConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["experience2-pricing-config", experienceId],
    queryFn: async () => {
      if (!experienceId) return null;
      const { data, error } = await supabase
        .from("experiences2")
        .select("commission_room_pct, commission_addons_pct, tax_pct, promo_type, promo_value, promo_is_percentage")
        .eq("id", experienceId)
        .single();
      if (error) throw error;
      return data as PricingConfig;
    },
    enabled: !!experienceId,
  });

  // Sync config state when data loads
  useEffect(() => {
    if (pricingConfig) {
      setCommissionRoomPct(pricingConfig.commission_room_pct ?? 0);
      setCommissionAddonsPct(pricingConfig.commission_addons_pct ?? 0);
      setTaxPct(pricingConfig.tax_pct ?? 0);
      setPromoType(pricingConfig.promo_type ?? "none");
      setPromoValue(pricingConfig.promo_value ?? 0);
      setPromoIsPercentage(pricingConfig.promo_is_percentage ?? true);
      setConfigDirty(false);
    }
  }, [pricingConfig]);

  // ─── Mutations: addons ───

  const addAddonMutation = useMutation({
    mutationFn: async () => {
      if (!experienceId) throw new Error("No experience ID");
      const maxOrder = (addons ?? []).reduce((m, a) => Math.max(m, a.calculation_order), 0);
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
      setNewAddonName("");
      setNewAddonNameHe("");
      setNewAddonValue(0);
      queryClient.invalidateQueries({ queryKey: ["experience2-addons", experienceId] });
    },
    onError: (err: any) => toast.error(err.message || "Erreur lors de l'ajout"),
  });

  const toggleAddonMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase.from("experience2_addons").update({ is_active: isActive }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience2-addons", experienceId] });
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
      queryClient.invalidateQueries({ queryKey: ["experience2-addons", experienceId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // ─── Mutation: save pricing config ───

  const saveConfigMutation = useMutation({
    mutationFn: async () => {
      if (!experienceId) throw new Error("No experience ID");
      const { error } = await supabase
        .from("experiences2")
        .update({
          commission_room_pct: commissionRoomPct,
          commission_addons_pct: commissionAddonsPct,
          tax_pct: taxPct,
          promo_type: promoType === "none" ? null : promoType,
          promo_value: promoType === "none" ? null : promoValue,
          promo_is_percentage: promoIsPercentage,
        })
        .eq("id", experienceId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Configuration pricing sauvegardée");
      setConfigDirty(false);
      queryClient.invalidateQueries({
        queryKey: ["experience2-pricing-config", experienceId],
      });
    },
    onError: (err: any) => toast.error(err.message || "Erreur sauvegarde"),
  });

  // ─── Filter per-person addons ───

  const perPersonAddons = (addons ?? []).filter((a) => a.type === "per_person");

  // ─── Loading / No experience ───

  if (!experienceId) {
    return (
      <div className="text-sm text-muted-foreground italic py-4">
        Sauvegardez d'abord l'expérience (brouillon) pour configurer le pricing.
      </div>
    );
  }

  if (isLoadingAddons || isLoadingConfig) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // ─── Render ───

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Configuration Pricing</h3>

      {/* ================================================================= */}
      {/* Section A: Addons par personne */}
      {/* ================================================================= */}
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
                      onCheckedChange={(checked) => toggleAddonMutation.mutate({ id: addon.id, isActive: checked })}
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
                onClick={() => addAddonMutation.mutate()}
                disabled={disabled || !newAddonName.trim() || newAddonValue <= 0 || addAddonMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* Section B: Commissions & Taxe */}
      {/* ================================================================= */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Percent className="h-4 w-4 text-orange-600" />
            Commissions & Taxe
          </CardTitle>
          <CardDescription>Commissions différenciées (chambre vs addons) et taux de taxe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="comm-room" className="text-xs">
                Commission chambre (%)
              </Label>
              <Input
                id="comm-room"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={commissionRoomPct || ""}
                onChange={(e) => {
                  setCommissionRoomPct(parseFloat(e.target.value) || 0);
                  setConfigDirty(true);
                }}
                placeholder="10"
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground mt-1">Appliquée sur le prix HyperGuest</p>
            </div>
            <div>
              <Label htmlFor="comm-addons" className="text-xs">
                Commission addons (%)
              </Label>
              <Input
                id="comm-addons"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={commissionAddonsPct || ""}
                onChange={(e) => {
                  setCommissionAddonsPct(parseFloat(e.target.value) || 0);
                  setConfigDirty(true);
                }}
                placeholder="15"
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground mt-1">Appliquée sur le total des addons par personne</p>
            </div>
            <div>
              <Label htmlFor="tax-pct" className="text-xs">
                Taxe (%)
              </Label>
              <Input
                id="tax-pct"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxPct || ""}
                onChange={(e) => {
                  setTaxPct(parseFloat(e.target.value) || 0);
                  setConfigDirty(true);
                }}
                placeholder="18"
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground mt-1">Appliquée sur chambre + addons + commissions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* Section C: Promo */}
      {/* ================================================================= */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4 text-purple-600" />
            Promo
          </CardTitle>
          <CardDescription>Remise réelle ou faux prix barré (marketing)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs">Type de promo</Label>
            <Select
              value={promoType}
              onValueChange={(val) => {
                setPromoType(val as PromoType | "none");
                setConfigDirty(true);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aucune" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune promo</SelectItem>
                <SelectItem value="real_discount">Remise réelle</SelectItem>
                <SelectItem value="fake_markup">Faux prix barré</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {promoType !== "none" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="promo-value" className="text-xs">
                  {promoType === "real_discount" ? "Valeur de la remise" : "Majoration affichée"}
                </Label>
                <Input
                  id="promo-value"
                  type="number"
                  min="0"
                  step="0.1"
                  value={promoValue || ""}
                  onChange={(e) => {
                    setPromoValue(parseFloat(e.target.value) || 0);
                    setConfigDirty(true);
                  }}
                  placeholder={promoType === "real_discount" ? "10" : "20"}
                  disabled={disabled}
                />
              </div>
              {promoType === "real_discount" && (
                <div>
                  <Label className="text-xs">Mode</Label>
                  <Select
                    value={promoIsPercentage ? "percentage" : "fixed"}
                    onValueChange={(val) => {
                      setPromoIsPercentage(val === "percentage");
                      setConfigDirty(true);
                    }}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                      <SelectItem value="fixed">Montant fixe ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {promoType === "real_discount" && promoValue > 0 && (
            <p className="text-xs text-muted-foreground">
              {promoIsPercentage
                ? `Le prix final sera réduit de ${promoValue}%`
                : `Le prix final sera réduit de $${promoValue.toFixed(2)}`}
            </p>
          )}

          {promoType === "fake_markup" && promoValue > 0 && (
            <p className="text-xs text-muted-foreground">
              Un prix barré {promoValue}% plus élevé sera affiché à côté du vrai prix. Aucune remise réelle n'est
              appliquée.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ================================================================= */}
      {/* Save config button */}
      {/* ================================================================= */}
      {configDirty && (
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => saveConfigMutation.mutate()}
            disabled={disabled || saveConfigMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveConfigMutation.isPending ? "Sauvegarde…" : "Sauvegarder le pricing"}
          </Button>
        </div>
      )}

      {/* ================================================================= */}
      {/* Delete confirmation dialog */}
      {/* ================================================================= */}
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
              onClick={() => deleteAddonId && deleteAddonMutation.mutate(deleteAddonId)}
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
