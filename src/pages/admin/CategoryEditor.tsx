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
import { ArrowLeft, Upload, X, Eye } from "lucide-react";

const CategoryEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== "new";

  const [formData, setFormData] = useState({
    name: "",
    name_he: "",
    slug: "",
    hero_image: "",
    presentation_title: "",
    presentation_title_he: "",
    intro_rich_text: "",
    intro_rich_text_he: "",
    bullets: ["", "", ""],
    display_order: 0,
    status: "draft" as "draft" | "published",
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

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
        name_he: category.name_he || "",
        slug: category.slug || "",
        hero_image: category.hero_image || "",
        presentation_title: category.presentation_title || "",
        presentation_title_he: category.presentation_title_he || "",
        intro_rich_text: category.intro_rich_text || "",
        intro_rich_text_he: category.intro_rich_text_he || "",
        bullets: category.bullets || ["", "", ""],
        display_order: category.display_order || 0,
        status: category.status || "draft",
      });
      setImagePreview(category.hero_image || "");
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("category-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("category-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, hero_image: publicUrl });
      setImagePreview(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, hero_image: "" });
    setImagePreview("");
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
          {formData.slug && (
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(`/category/${formData.slug}`, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
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
              <Label htmlFor="hero_image">Hero Image</Label>
              <div className="space-y-4">
                {imagePreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="file"
                    id="hero_image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={() => document.getElementById("hero_image")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Recommended: 1920x1080px, max 5MB
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="presentation_title">Presentation Title *</Label>
              <Input
                id="presentation_title"
                value={formData.presentation_title}
                onChange={(e) => setFormData({ ...formData, presentation_title: e.target.value })}
                placeholder="e.g., Your Perfect Romantic Escape Awaits"
                required
              />
              <p className="text-sm text-muted-foreground">
                Large title displayed on the left side of the category page
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intro">Introduction Text (English) *</Label>
              <Textarea
                id="intro"
                value={formData.intro_rich_text}
                onChange={(e) => setFormData({ ...formData, intro_rich_text: e.target.value })}
                placeholder="A captivating description of this category..."
                rows={4}
                required
              />
              <p className="text-sm text-muted-foreground">
                Description displayed on the right side of the category page
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-sm text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hebrew Translation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name_he">Category Name (Hebrew)</Label>
              <Input
                id="name_he"
                value={formData.name_he}
                onChange={(e) => setFormData({ ...formData, name_he: e.target.value })}
                placeholder="שם הקטגוריה בעברית"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="presentation_title_he">Presentation Title (Hebrew)</Label>
              <Input
                id="presentation_title_he"
                value={formData.presentation_title_he}
                onChange={(e) => setFormData({ ...formData, presentation_title_he: e.target.value })}
                placeholder="כותרת גדולה של הקטגוריה"
                dir="rtl"
              />
              <p className="text-sm text-muted-foreground">
                Large title for Hebrew version
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intro_he">Introduction Text (Hebrew)</Label>
              <Textarea
                id="intro_he"
                value={formData.intro_rich_text_he}
                onChange={(e) => setFormData({ ...formData, intro_rich_text_he: e.target.value })}
                placeholder="תיאור מרתק של הקטגוריה..."
                rows={4}
                dir="rtl"
              />
              <p className="text-sm text-muted-foreground">
                Description for Hebrew version
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.bullets.map((bullet, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1 space-y-2">
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
                {formData.bullets.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-8"
                    onClick={() => {
                      const newBullets = formData.bullets.filter((_, i) => i !== index);
                      setFormData({ ...formData, bullets: newBullets });
                    }}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({ ...formData, bullets: [...formData.bullets, ""] })}
            >
              Add Feature
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CategoryEditor;
