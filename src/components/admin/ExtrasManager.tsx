import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface ExtrasManagerProps {
  experienceId: string;
}

const ExtrasManager = ({ experienceId }: ExtrasManagerProps) => {
  const queryClient = useQueryClient();
  const [newExtra, setNewExtra] = useState({
    name: "",
    description: "",
    price: "",
    pricing_type: "per_booking" as "per_booking" | "per_night" | "per_person",
    image_url: "",
  });

  const { data: extras, isLoading } = useQuery({
    queryKey: ["experience-extras", experienceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extras")
        .select("*")
        .eq("experience_id", experienceId)
        .order("sort_order");

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!newExtra.name.trim() || !newExtra.price) {
        throw new Error("Name and price are required");
      }

      const maxOrder = extras?.length ? Math.max(...extras.map(e => e.sort_order)) : -1;
      
      const { error } = await supabase
        .from("extras")
        .insert([{
          experience_id: experienceId,
          name: newExtra.name,
          description: newExtra.description || null,
          price: parseFloat(newExtra.price),
          pricing_type: newExtra.pricing_type,
          image_url: newExtra.image_url || null,
          sort_order: maxOrder + 1,
          is_available: true,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-extras", experienceId] });
      setNewExtra({ name: "", description: "", price: "", pricing_type: "per_booking", image_url: "" });
      toast.success("Extra added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("extras")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-extras", experienceId] });
      toast.success("Extra deleted");
    },
  });

  const toggleAvailableMutation = useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { error } = await supabase
        .from("extras")
        .update({ is_available })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-extras", experienceId] });
      toast.success("Extra updated");
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extras / Add-ons</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 p-4 border border-border rounded-lg">
          <h4 className="font-medium">Add new extra</h4>
          <Input
            placeholder="Name *"
            value={newExtra.name}
            onChange={(e) => setNewExtra({ ...newExtra, name: e.target.value })}
          />
          <Textarea
            placeholder="Description (optional)"
            value={newExtra.description}
            onChange={(e) => setNewExtra({ ...newExtra, description: e.target.value })}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Price *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={newExtra.price}
                onChange={(e) => setNewExtra({ ...newExtra, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Pricing type</Label>
              <Select
                value={newExtra.pricing_type}
                onValueChange={(value) => setNewExtra({ ...newExtra, pricing_type: value as "per_booking" | "per_night" | "per_person" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_booking">Per booking</SelectItem>
                  <SelectItem value="per_person">Per person</SelectItem>
                  <SelectItem value="per_night">Per night</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ImageUpload
            label="Extra Image (optional)"
            bucket="experience-images"
            value={newExtra.image_url}
            onChange={(url) => setNewExtra({ ...newExtra, image_url: url })}
            description="Image for this add-on"
          />
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            Add Extra
          </Button>
        </div>

        {extras && extras.length > 0 && (
          <div className="space-y-2">
            {extras.map((extra) => (
              <div
                key={extra.id}
                className="flex items-center gap-3 p-3 border border-border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{extra.name}</div>
                  <div className="text-sm text-muted-foreground">
                    ${extra.price} / {extra.pricing_type.replace("_", " ")}
                  </div>
                  {extra.description && (
                    <div className="text-sm text-muted-foreground mt-1">{extra.description}</div>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => toggleAvailableMutation.mutate({
                    id: extra.id,
                    is_available: !extra.is_available
                  })}
                >
                  {extra.is_available ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(extra.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtrasManager;
