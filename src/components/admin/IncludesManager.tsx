import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Upload } from "lucide-react";
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
    description: "",
    icon_url: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
          description: newInclude.description || null,
          icon_url: imageUrl || null,
          order_index: maxOrder + 1,
          published: true,
        }]);

      if (error) throw error;
      setIsUploading(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-includes", experienceId] });
      setNewInclude({ title: "", description: "", icon_url: "" });
      setImageFile(null);
      setImagePreview(null);
      toast.success("Include added successfully");
    },
    onError: (error: Error) => {
      setIsUploading(false);
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
      toast.success("Include deleted");
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
      toast.success("Include updated");
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>What's Included</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 p-4 border border-border rounded-lg">
          <h4 className="font-medium">Add new item</h4>
          <Input
            placeholder="Title *"
            value={newInclude.title}
            onChange={(e) => setNewInclude({ ...newInclude, title: e.target.value })}
          />
          <Textarea
            placeholder="Description (optional)"
            value={newInclude.description}
            onChange={(e) => setNewInclude({ ...newInclude, description: e.target.value })}
            rows={2}
          />
          
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex gap-2 items-start">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                disabled={!imageFile}
              >
                Clear
              </Button>
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
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || isUploading}
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
                className="flex items-start gap-3 p-3 border border-border rounded-lg"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-move mt-1" />
                {include.icon_url && (
                  <img 
                    src={include.icon_url} 
                    alt={include.title} 
                    className="w-20 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium">{include.title}</div>
                  {include.description && (
                    <div className="text-sm text-muted-foreground">{include.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={include.published}
                      onCheckedChange={(checked) => 
                        togglePublishedMutation.mutate({ id: include.id, published: checked })
                      }
                    />
                    <Label className="text-sm">
                      {include.published ? "Published" : "Draft"}
                    </Label>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(include.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncludesManager;
