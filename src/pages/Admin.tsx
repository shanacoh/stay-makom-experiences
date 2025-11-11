import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Loader2, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { z } from "zod";

const categorySchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  name: z.string().min(1, "Name is required"),
  intro_rich_text: z.string().optional(),
  hero_image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  bullet1: z.string().min(1, "Bullet point 1 is required"),
  bullet2: z.string().min(1, "Bullet point 2 is required"),
  bullet3: z.string().min(1, "Bullet point 3 is required"),
  status: z.enum(["draft", "published"]),
});

const Admin = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    intro_rich_text: "",
    hero_image: "",
    bullet1: "",
    bullet2: "",
    bullet3: "",
    status: "draft" as "draft" | "published",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const validated = categorySchema.parse(data);
      const { error } = await supabase.from("categories").insert({
        slug: validated.slug,
        name: validated.name,
        intro_rich_text: validated.intro_rich_text,
        hero_image: validated.hero_image || null,
        bullets: [validated.bullet1, validated.bullet2, validated.bullet3],
        status: validated.status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category created successfully");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const validated = categorySchema.parse(data);
      const { error } = await supabase
        .from("categories")
        .update({
          slug: validated.slug,
          name: validated.name,
          intro_rich_text: validated.intro_rich_text,
          hero_image: validated.hero_image || null,
          bullets: [validated.bullet1, validated.bullet2, validated.bullet3],
          status: validated.status,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category updated successfully");
      resetForm();
      setEditingCategory(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const moveCategory = async (categoryId: string, direction: "up" | "down") => {
    if (!categories) return;
    
    const currentIndex = categories.findIndex((c) => c.id === categoryId);
    if (currentIndex === -1) return;
    
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= categories.length) return;
    
    const currentCategory = categories[currentIndex];
    const swapCategory = categories[swapIndex];
    
    // Swap display_order values
    const { error: error1 } = await supabase
      .from("categories")
      .update({ display_order: swapCategory.display_order })
      .eq("id", currentCategory.id);
    
    const { error: error2 } = await supabase
      .from("categories")
      .update({ display_order: currentCategory.display_order })
      .eq("id", swapCategory.id);
    
    if (error1 || error2) {
      toast.error("Failed to reorder categories");
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    toast.success("Category order updated");
  };

  const resetForm = () => {
    setFormData({
      slug: "",
      name: "",
      intro_rich_text: "",
      hero_image: "",
      bullet1: "",
      bullet2: "",
      bullet3: "",
      status: "draft",
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5242880) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('category-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('category-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      slug: category.slug,
      name: category.name,
      intro_rich_text: category.intro_rich_text || "",
      hero_image: category.hero_image || "",
      bullet1: category.bullets?.[0] || "",
      bullet2: category.bullets?.[1] || "",
      bullet3: category.bullets?.[2] || "",
      status: category.status,
    });
    setImagePreview(category.hero_image || null);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      
      let heroImageUrl = formData.hero_image;
      
      // Upload new image if one was selected
      if (imageFile) {
        heroImageUrl = await uploadImage(imageFile);
      }
      
      const dataToSubmit = {
        ...formData,
        hero_image: heroImageUrl,
      };
      
      if (editingCategory) {
        updateMutation.mutate({ id: editingCategory.id, data: dataToSubmit });
      } else {
        createMutation.mutate(dataToSubmit);
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container pt-24 pb-16">
        <h1 className="font-serif text-4xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="hotels">Hotels</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-8">
            {/* Create/Edit Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingCategory ? "Edit Category" : "Create Category"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="romantic-escape"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Romantic Escape"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="intro">Intro Text</Label>
                    <Textarea
                      id="intro"
                      value={formData.intro_rich_text}
                      onChange={(e) => setFormData({ ...formData, intro_rich_text: e.target.value })}
                      placeholder="Stolen moments and candlelit rituals..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero">Hero Image</Label>
                    <div className="space-y-4">
                      {imagePreview && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                              setFormData({ ...formData, hero_image: "" });
                            }}
                            className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <Input
                          id="hero"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <Label
                          htmlFor="hero"
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
                        >
                          <Upload className="h-4 w-4" />
                          {imageFile ? "Change Image" : "Upload Image"}
                        </Label>
                        {imageFile && (
                          <span className="text-sm text-muted-foreground">
                            {imageFile.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Max size: 5MB. Formats: JPG, PNG, WebP
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Bullets (exactly 3 required)</Label>
                    <Input
                      value={formData.bullet1}
                      onChange={(e) => setFormData({ ...formData, bullet1: e.target.value })}
                      placeholder="Bullet point 1"
                      required
                    />
                    <Input
                      value={formData.bullet2}
                      onChange={(e) => setFormData({ ...formData, bullet2: e.target.value })}
                      placeholder="Bullet point 2"
                      required
                    />
                    <Input
                      value={formData.bullet3}
                      onChange={(e) => setFormData({ ...formData, bullet3: e.target.value })}
                      placeholder="Bullet point 3"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full border rounded-md p-2"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={uploading}>
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        `${editingCategory ? "Update" : "Create"} Category`
                      )}
                    </Button>
                    {editingCategory && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingCategory(null);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Categories List */}
            <Card>
              <CardHeader>
                <CardTitle>All Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories?.map((category, index) => (
                    <div
                      key={category.id}
                      className="border rounded-lg p-4 flex justify-between items-start"
                    >
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">/{category.slug}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                            category.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {category.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveCategory(category.id, "up")}
                          disabled={index === 0}
                          title="Move up"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => moveCategory(category.id, "down")}
                          disabled={index === categories.length - 1}
                          title="Move down"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this category?")) {
                              deleteMutation.mutate(category.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hotels">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Hotels management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Bookings management coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
