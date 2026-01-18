import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

interface ExperienceExtrasSelectorProps {
  experienceId: string;
  hotelId: string;
}

interface EditingExtra {
  id: string;
  name: string;
  name_he: string;
  description: string;
  description_he: string;
  price: string;
  pricing_type: string;
}

const ExperienceExtrasSelector = ({ experienceId, hotelId }: ExperienceExtrasSelectorProps) => {
  const queryClient = useQueryClient();
  const [editingExtra, setEditingExtra] = useState<EditingExtra | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch ALL hotel extras (not just available ones)
  const { data: hotelExtras, isLoading: isLoadingExtras } = useQuery({
    queryKey: ["hotel-extras", hotelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extras")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("is_available", { ascending: false })
        .order("sort_order");

      if (error) throw error;
      return data;
    },
  });

  // Fetch selected extras for this experience
  const { data: selectedExtras, isLoading: isLoadingSelected } = useQuery({
    queryKey: ["experience-extras-links", experienceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience_extras")
        .select("extra_id")
        .eq("experience_id", experienceId);

      if (error) throw error;
      return data.map(item => item.extra_id);
    },
  });

  // Toggle link between experience and extra
  const toggleExtraMutation = useMutation({
    mutationFn: async ({ extraId, isChecked }: { extraId: string; isChecked: boolean }) => {
      if (isChecked) {
        const { error } = await supabase
          .from("experience_extras")
          .insert([{ experience_id: experienceId, extra_id: extraId }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("experience_extras")
          .delete()
          .eq("experience_id", experienceId)
          .eq("extra_id", extraId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-extras-links", experienceId] });
      toast.success("Extras updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Toggle availability mutation
  const toggleAvailableMutation = useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { error } = await supabase
        .from("extras")
        .update({ is_available })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotel-extras", hotelId] });
      toast.success("Extra visibility updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Delete extra mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First remove all experience_extras links
      await supabase.from("experience_extras").delete().eq("extra_id", id);
      // Then delete the extra
      const { error } = await supabase.from("extras").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotel-extras", hotelId] });
      queryClient.invalidateQueries({ queryKey: ["experience-extras-links", experienceId] });
      toast.success("Extra deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Update extra mutation
  const updateMutation = useMutation({
    mutationFn: async (extra: EditingExtra) => {
      const { error } = await supabase
        .from("extras")
        .update({
          name: extra.name,
          name_he: extra.name_he || null,
          description: extra.description || null,
          description_he: extra.description_he || null,
          price: parseFloat(extra.price),
          pricing_type: extra.pricing_type as "per_booking" | "per_person" | "per_night",
        })
        .eq("id", extra.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotel-extras", hotelId] });
      setEditDialogOpen(false);
      setEditingExtra(null);
      toast.success("Extra updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleEditClick = (extra: NonNullable<typeof hotelExtras>[0]) => {
    setEditingExtra({
      id: extra.id,
      name: extra.name,
      name_he: extra.name_he || "",
      description: extra.description || "",
      description_he: extra.description_he || "",
      price: String(extra.price),
      pricing_type: extra.pricing_type || "per_booking",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingExtra) {
      updateMutation.mutate(editingExtra);
    }
  };

  if (isLoadingExtras || isLoadingSelected) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!hotelExtras || hotelExtras.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No extras available for this hotel yet.</p>
        <p className="text-sm mt-1">Hotel admins can create extras in their back-office.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {hotelExtras.map((extra) => {
          const isChecked = selectedExtras?.includes(extra.id) || false;
          
          return (
            <div
              key={extra.id}
              className={`flex items-start gap-3 p-4 border rounded-lg transition-colors ${
                extra.is_available 
                  ? "border-border hover:bg-muted/30" 
                  : "border-muted bg-muted/20 opacity-60"
              }`}
            >
              {/* Checkbox to link/unlink */}
              <Checkbox
                id={`extra-${extra.id}`}
                checked={isChecked}
                onCheckedChange={(checked) => 
                  toggleExtraMutation.mutate({ extraId: extra.id, isChecked: checked as boolean })
                }
                disabled={toggleExtraMutation.isPending || !extra.is_available}
              />
              
              {/* Extra details */}
              <div className="flex-1 min-w-0">
                <Label 
                  htmlFor={`extra-${extra.id}`}
                  className="cursor-pointer font-medium flex items-center gap-2 flex-wrap"
                >
                  {extra.name}
                  {!extra.is_available && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">Hidden</span>
                  )}
                </Label>
                {extra.name_he && (
                  <span className="text-muted-foreground text-sm block" dir="rtl">{extra.name_he}</span>
                )}
                <div className="text-sm font-semibold text-primary mt-1">
                  {extra.price} {extra.currency} / {extra.pricing_type?.replace("_", " ") || "per booking"}
                </div>
                {extra.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{extra.description}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Toggle visibility */}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleAvailableMutation.mutate({ 
                    id: extra.id, 
                    is_available: !extra.is_available 
                  })}
                  disabled={toggleAvailableMutation.isPending}
                  title={extra.is_available ? "Hide extra" : "Show extra"}
                >
                  {extra.is_available ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>

                {/* Edit button */}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleEditClick(extra)}
                  title="Edit extra"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>

                {/* Delete button with confirmation */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" title="Delete extra">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Extra?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{extra.name}" and remove it from all experiences. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteMutation.mutate(extra.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Extra</DialogTitle>
          </DialogHeader>
          
          {editingExtra && (
            <div className="space-y-6 py-4">
              {/* Bilingual layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* English column */}
                <div className="space-y-4">
                  <div className="bg-muted/30 p-2 rounded text-sm font-medium">English</div>
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      placeholder="Name"
                      value={editingExtra.name}
                      onChange={(e) => setEditingExtra(prev => prev ? {...prev, name: e.target.value} : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Description"
                      value={editingExtra.description}
                      onChange={(e) => setEditingExtra(prev => prev ? {...prev, description: e.target.value} : null)}
                    />
                  </div>
                </div>
                
                {/* Hebrew column */}
                <div className="space-y-4">
                  <div className="bg-blue-50/50 p-2 rounded text-sm font-medium">עברית</div>
                  <div>
                    <Label htmlFor="edit-name-he">שם</Label>
                    <Input
                      id="edit-name-he"
                      placeholder="שם"
                      dir="rtl"
                      className="bg-blue-50/50"
                      value={editingExtra.name_he}
                      onChange={(e) => setEditingExtra(prev => prev ? {...prev, name_he: e.target.value} : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description-he">תיאור</Label>
                    <Textarea
                      id="edit-description-he"
                      placeholder="תיאור"
                      dir="rtl"
                      className="bg-blue-50/50"
                      value={editingExtra.description_he}
                      onChange={(e) => setEditingExtra(prev => prev ? {...prev, description_he: e.target.value} : null)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Price and pricing type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    placeholder="Price"
                    value={editingExtra.price}
                    onChange={(e) => setEditingExtra(prev => prev ? {...prev, price: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-pricing-type">Pricing Type</Label>
                  <Select
                    value={editingExtra.pricing_type}
                    onValueChange={(v) => setEditingExtra(prev => prev ? {...prev, pricing_type: v} : null)}
                  >
                    <SelectTrigger id="edit-pricing-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_booking">Per Booking</SelectItem>
                      <SelectItem value="per_person">Per Person</SelectItem>
                      <SelectItem value="per_night">Per Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExperienceExtrasSelector;
