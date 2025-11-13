import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const CategoryEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== "new";

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    hero_image: "",
    intro_rich_text: "",
    bullets: ["", "", ""],
    status: "draft" as "draft" | "published",
  });

  const { data: category } = useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      if (!isEditing) return null;
      const { data, error } = await supabase
        .from("categories" as any)
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        hero_image: category.hero_image || "",
        intro_rich_text: category.intro_rich_text || "",
        bullets: category.bullets || ["", "", ""],
        status: category.status || "draft",
      });
    }
  }, [category]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isEditing) {
        const { error } = await supabase
          .from("categories" as any)
          .update(data)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories" as any).insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(`Category ${isEditing ? "updated" : "created"} successfully`);
      navigate("/admin/categories");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const publishData = { ...data, status: "published" as const };
      if (isEditing) {
        const { error } = await supabase
          .from("categories" as any)
          .update(publishData)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories" as any).insert([publishData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Category published successfully");
      navigate("/admin/categories");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/categories")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">
              {isEditing ? "Edit Category" : "New Category"}
            </h2>
            <p className="text-muted-foreground">
              {isEditing ? "Update category details" : "Create a new experience category"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSubmit} disabled={saveMutation.isPending}>
            Save Draft
          </Button>
          <Button
            onClick={() => publishMutation.mutate(formData)}
            disabled={publishMutation.isPending}
          >
            Publish
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Desert Escapes"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="desert-escapes"
                required
              />
              <p className="text-sm text-muted-foreground">
                URL-friendly version of the name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero_image">Hero Image URL</Label>
              <Input
                id="hero_image"
                value={formData.hero_image}
                onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intro">Introduction Text</Label>
              <Textarea
                id="intro"
                value={formData.intro_rich_text}
                onChange={(e) => setFormData({ ...formData, intro_rich_text: e.target.value })}
                placeholder="A captivating description of this category..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.bullets.map((bullet, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`bullet-${index}`}>Feature {index + 1}</Label>
                <Input
                  id={`bullet-${index}`}
                  value={bullet}
                  onChange={(e) => {
                    const newBullets = [...formData.bullets];
                    newBullets[index] = e.target.value;
                    setFormData({ ...formData, bullets: newBullets });
                  }}
                  placeholder="e.g., Stunning desert landscapes"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CategoryEditor;
