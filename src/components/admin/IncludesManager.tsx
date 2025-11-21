import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Upload, Edit2, Save, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface IncludesManagerProps {
  experienceId: string;
}

const IncludesManager = ({ experienceId }: IncludesManagerProps) => {
  const queryClient = useQueryClient();
  const [newInclude, setNewInclude] = useState({
    title: "",
    icon_url: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const { data: includes, isLoading } = useQuery({
    queryKey: ["experience-includes", experienceId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("experience_includes")
        .select("*")
        .eq("experience_id", experienceId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('experience-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('experience-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!newInclude.title.trim()) {
        throw new Error("Title is required");
      }

      setIsUploading(true);
      let imageUrl = newInclude.icon_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const maxOrder = includes?.length ? Math.max(...includes.map((i: any) => i.order_index)) : -1;
      
      const { error } = await (supabase as any)
        .from("experience_includes")
        .insert([{
          experience_id: experienceId,
          title: newInclude.title,
          icon_url: imageUrl || null,
          order_index: maxOrder + 1,
          published: true,
        }]);

      if (error) throw error;
      setIsUploading(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-includes", experienceId] });
      setNewInclude({ title: "", icon_url: "" });
      setImageFile(null);
      setImagePreview(null);
      toast.success("Item added successfully");
    },
    onError: (error: Error) => {
      setIsUploading(false);
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, icon_url }: { id: string; title: string; icon_url: string | null }) => {
      let finalIconUrl = icon_url;

      if (editImageFile) {
        finalIconUrl = await uploadImage(editImageFile);
      }

      const { error } = await (supabase as any)
        .from("experience_includes")
        .update({ 
          title,
          icon_url: finalIconUrl 
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-includes", experienceId] });
      setEditingId(null);
      setEditTitle("");
      setEditImageFile(null);
      setEditImagePreview(null);
      toast.success("Item updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("experience_includes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-includes", experienceId] });
      toast.success("Item deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete item");
    },
  });

  const togglePublishedMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await (supabase as any)
        .from("experience_includes")
        .update({ published })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-includes", experienceId] });
      toast.success("Item updated");
    },
  });

  const startEditing = (include: any) => {
    setEditingId(include.id);
    setEditTitle(include.title);
    setEditImagePreview(include.icon_url);
    setEditImageFile(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const saveEdit = (include: any) => {
    if (!editTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    updateMutation.mutate({
      id: include.id,
      title: editTitle,
      icon_url: include.icon_url,
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>What's Included</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
          <h4 className="font-medium">Add new item</h4>
          <Input
            placeholder="Title *"
            value={newInclude.title}
            onChange={(e) => setNewInclude({ ...newInclude, title: e.target.value })}
          />
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Image *</Label>
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => document.getElementById('new-include-image')?.click()}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {imageFile ? imageFile.name : "Choose image"}
              </Button>
              <input
                id="new-include-image"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {imageFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <Button
            type="button"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || isUploading || !newInclude.title.trim()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Add Item"}
          </Button>
        </div>

        {!includes || includes.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No items yet</p>
        ) : (
          <div className="space-y-2">
            {includes.map((include: any) => (
              <div
                key={include.id}
                className="flex items-start gap-3 p-3 border border-border rounded-lg bg-card"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-move mt-1 flex-shrink-0" />
                
                {editingId === include.id ? (
                  // Edit mode
                  <div className="flex-1 space-y-3">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title"
                    />
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => document.getElementById(`edit-image-${include.id}`)?.click()}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        {editImageFile ? editImageFile.name : "Change image"}
                      </Button>
                      <input
                        id={`edit-image-${include.id}`}
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageSelect}
                        className="hidden"
                      />
                      {editImagePreview && (
                        <img 
                          src={editImagePreview} 
                          alt="Preview" 
                          className="w-32 h-24 object-cover rounded-lg border"
                        />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => saveEdit(include)}
                        disabled={updateMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditing}
                        disabled={updateMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    {include.icon_url && (
                      <img 
                        src={include.icon_url} 
                        alt={include.title} 
                        className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{include.title}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={include.published}
                          onCheckedChange={(checked) => 
                            togglePublishedMutation.mutate({ id: include.id, published: checked })
                          }
                        />
                        <Label className="text-sm whitespace-nowrap">
                          {include.published ? "Published" : "Draft"}
                        </Label>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => startEditing(include)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(include.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncludesManager;
