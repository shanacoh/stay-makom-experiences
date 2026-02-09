import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Eye, EyeOff, Copy, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnifiedExperience2Form } from "@/components/forms/UnifiedExperience2Form";
import { toast } from "sonner";
import { generateSlug } from "@/lib/utils";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatAddonValue, getAddonTypeLabelEn, type AddonType } from "@/types/experience2_addons";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AdminExperiences2 = () => {
  const navigate = useNavigate();
  const { experienceId } = useParams();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [hotelFilter, setHotelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(null);

  const isFormView = window.location.pathname.includes("/new") || window.location.pathname.includes("/edit");

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  // Fetch all hotels2 for filter dropdown
  const { data: hotels } = useQuery({
    queryKey: ["admin-hotels2-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hotels2").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch all categories for filter
  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch all experiences2 with hotel, category, addons AND junction parcours
  const { data: experiences, isLoading } = useQuery({
    queryKey: ["admin-experiences2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences2")
        .select(
          `
          *,
          hotels2 (id, name),
          categories (id, name),
          experience2_addons (id, type, name, value, is_percentage),
          experience2_hotels (id, position, nights, hotels2 (id, name))
        `,
        )
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // -------------------------------------------------------------------------
  // Filter experiences
  // -------------------------------------------------------------------------

  const filteredExperiences = experiences?.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || exp.status === statusFilter;

    // Hotel filter: match if hotel_id matches OR any junction hotel matches
    let matchesHotel = true;
    if (hotelFilter !== "all") {
      const junctionHotelIds = ((exp as any).experience2_hotels || []).map((eh: any) => eh.hotels2?.id);
      matchesHotel = exp.hotel_id === hotelFilter || junctionHotelIds.includes(hotelFilter);
    }

    const matchesCategory = categoryFilter === "all" || exp.category_id === categoryFilter;
    return matchesSearch && matchesStatus && matchesHotel && matchesCategory;
  });

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleCreateNew = () => {
    navigate("/admin/experiences2/new");
  };

  const handleCloseForm = () => {
    navigate("/admin/experiences2");
    queryClient.invalidateQueries({ queryKey: ["admin-experiences2"] });
  };

  // -------------------------------------------------------------------------
  // Mutations
  // -------------------------------------------------------------------------

  // Toggle visibility
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const newStatus = currentStatus === "published" ? "draft" : "published";
      const { error } = await supabase.from("experiences2").update({ status: newStatus }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experiences2"] });
      toast.success("Experience visibility updated");
    },
    onError: () => {
      toast.error("Error updating visibility");
    },
  });

  // Duplicate (copies experience + junction table rows)
  const duplicateMutation = useMutation({
    mutationFn: async (expId: string) => {
      // 1. Fetch original experience
      const { data: original, error: fetchError } = await supabase
        .from("experiences2")
        .select("*")
        .eq("id", expId)
        .single();
      if (fetchError) throw fetchError;

      // 2. Insert new experience
      const { id, created_at, updated_at, ...rest } = original;
      const newSlug = generateSlug(`${original.title}-copy-${Date.now()}`);
      const { data: inserted, error: insertError } = await supabase
        .from("experiences2")
        .insert([
          {
            ...rest,
            title: `${original.title} (Copy)`,
            title_he: original.title_he ? `${original.title_he} (עותק)` : null,
            slug: newSlug,
            status: "draft" as const,
          },
        ])
        .select("id")
        .single();
      if (insertError) throw insertError;

      // 3. Copy junction table rows (experience2_hotels)
      const { data: junctionRows, error: jError } = await supabase
        .from("experience2_hotels")
        .select("*")
        .eq("experience_id", expId)
        .order("position");
      if (jError) throw jError;

      if (junctionRows && junctionRows.length > 0) {
        const newRows = junctionRows.map(({ id: _id, experience_id: _eid, ...row }) => ({
          ...row,
          experience_id: inserted.id,
        }));
        const { error: jInsertError } = await supabase.from("experience2_hotels").insert(newRows);
        if (jInsertError) throw jInsertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experiences2"] });
      toast.success("Experience duplicated successfully");
    },
    onError: (error: any) => {
      console.error("Duplicate error:", error);
      toast.error(error.message || "Error duplicating experience");
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (expId: string) => {
      const { error } = await supabase.from("experiences2").delete().eq("id", expId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experiences2"] });
      toast.success("Experience deleted");
      setDeleteDialogOpen(false);
      setExperienceToDelete(null);
    },
    onError: () => {
      toast.error("Error deleting experience");
    },
  });

  const handleDeleteClick = (expId: string) => {
    setExperienceToDelete(expId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (experienceToDelete) {
      deleteMutation.mutate(experienceToDelete);
    }
  };

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      pending: "secondary",
      published: "default",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  /** Build a nice "Hotel A (3N) → Hotel B (2N)" label from junction data */
  const buildParcoursLabel = (experience: any) => {
    const junctionHotels = (experience.experience2_hotels || [])
      .slice()
      .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));

    if (junctionHotels.length > 0) {
      return junctionHotels.map((eh: any, idx: number) => (
        <span key={eh.id} className="inline-flex items-center gap-1">
          {idx > 0 && <span className="text-muted-foreground mx-1">→</span>}
          <Badge variant="secondary" className="text-xs font-normal">
            {eh.hotels2?.name ?? "?"} ({eh.nights ?? 1}N)
          </Badge>
        </span>
      ));
    }

    // Fallback to legacy hotel_id
    if (experience.hotels2?.name) {
      return (
        <Badge variant="secondary" className="text-xs font-normal">
          {experience.hotels2.name}
        </Badge>
      );
    }

    return <span className="text-muted-foreground/60">No hotel</span>;
  };

  // -------------------------------------------------------------------------
  // Form view (no hotel pre-selection – hotels are managed inside the form)
  // -------------------------------------------------------------------------

  if (isFormView) {
    return (
      <div className="container mx-auto p-6">
        <UnifiedExperience2Form experienceId={experienceId} onClose={handleCloseForm} />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // List view
  // -------------------------------------------------------------------------

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Experiences 2</h1>
          <p className="text-muted-foreground">Manage experiences (V2 independent system)</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Experience 2
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <Select value={hotelFilter} onValueChange={setHotelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All hotels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All hotels</SelectItem>
                {hotels?.map((hotel) => (
                  <SelectItem key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Experiences List */}
      {isLoading ? (
        <div className="text-center py-12">Loading experiences...</div>
      ) : !filteredExperiences?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No experiences found</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredExperiences.map((experience) => (
            <Card key={experience.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{experience.title}</h3>
                      {getStatusBadge(experience.status || "draft")}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 flex-wrap">
                        <strong>Parcours:</strong> {buildParcoursLabel(experience)}
                      </div>
                      <p>
                        <strong>Category:</strong> {(experience as any).categories?.name || "No category"}
                      </p>
                      <div>
                        <strong>Pricing:</strong>{" "}
                        {(experience as any).experience2_addons?.length > 0 ? (
                          <span className="inline-flex flex-wrap gap-1 ml-1">
                            {(experience as any).experience2_addons.map((addon: any) => (
                              <Badge key={addon.id} variant="outline" className="text-xs">
                                {getAddonTypeLabelEn(addon.type as AddonType)}: {formatAddonValue(addon)}
                              </Badge>
                            ))}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">Not configured</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              toggleVisibilityMutation.mutate({
                                id: experience.id,
                                currentStatus: experience.status || "draft",
                              })
                            }
                          >
                            {experience.status === "published" ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{experience.status === "published" ? "Unpublish" : "Publish"}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => duplicateMutation.mutate(experience.id)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Duplicate</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/admin/experiences2/edit/${experience.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteClick(experience.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Experience</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this experience? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminExperiences2;
