import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
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

  const { data: includes, isLoading } = useQuery({
    queryKey: ["experience-includes", experienceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience_includes")
        .select("*")
        .eq("experience_id", experienceId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!newInclude.title.trim()) {
        throw new Error("Title is required");
      }

      const maxOrder = includes?.length ? Math.max(...includes.map(i => i.order_index)) : -1;
      
      const { error } = await supabase
        .from("experience_includes")
        .insert([{
          experience_id: experienceId,
          title: newInclude.title,
          description: newInclude.description || null,
          icon_url: newInclude.icon_url || null,
          order_index: maxOrder + 1,
          published: true,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-includes", experienceId] });
      setNewInclude({ title: "", description: "", icon_url: "" });
      toast.success("Include added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
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
      const { error } = await supabase
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
          <Input
            placeholder="Icon URL (optional)"
            value={newInclude.icon_url}
            onChange={(e) => setNewInclude({ ...newInclude, icon_url: e.target.value })}
          />
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {includes && includes.length > 0 && (
          <div className="space-y-2">
            {includes.map((include) => (
              <div
                key={include.id}
                className="flex items-center gap-3 p-3 border border-border rounded-lg"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">{include.title}</div>
                  {include.description && (
                    <div className="text-sm text-muted-foreground">{include.description}</div>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => togglePublishedMutation.mutate({
                    id: include.id,
                    published: !include.published
                  })}
                >
                  {include.published ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(include.id)}
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

export default IncludesManager;
