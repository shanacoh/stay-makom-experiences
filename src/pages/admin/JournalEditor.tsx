import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { generateSlug } from "@/lib/utils";

const JournalEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title_en: "",
    title_he: "",
    cover_image: "",
    category: "Stories",
    excerpt_en: "",
    excerpt_he: "",
    content_en: "",
    content_he: "",
    author_name: "STAYMAKOM",
    status: "draft",
    seo_title_en: "",
    seo_title_he: "",
    seo_title_fr: "",
    meta_description_en: "",
    meta_description_he: "",
    meta_description_fr: "",
    og_title_en: "",
    og_title_he: "",
    og_title_fr: "",
    og_description_en: "",
    og_description_he: "",
    og_description_fr: "",
    og_image: "",
  });

  const { data: post, isLoading } = useQuery({
    queryKey: ["journal-post", id],
    queryFn: async () => {
      if (!isEdit) return null;
      const { data, error } = await supabase
        .from("journal_posts" as any)
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title_en: post.title_en || "",
        title_he: post.title_he || "",
        cover_image: post.cover_image || "",
        category: post.category,
        excerpt_en: post.excerpt_en || "",
        excerpt_he: post.excerpt_he || "",
        content_en: post.content_en || "",
        content_he: post.content_he || "",
        author_name: post.author_name,
        status: post.status,
        seo_title_en: post.seo_title_en || "",
        seo_title_he: post.seo_title_he || "",
        seo_title_fr: post.seo_title_fr || "",
        meta_description_en: post.meta_description_en || "",
        meta_description_he: post.meta_description_he || "",
        meta_description_fr: post.meta_description_fr || "",
        og_title_en: post.og_title_en || "",
        og_title_he: post.og_title_he || "",
        og_title_fr: post.og_title_fr || "",
        og_description_en: post.og_description_en || "",
        og_description_he: post.og_description_he || "",
        og_description_fr: post.og_description_fr || "",
        og_image: post.og_image || "",
      });
    }
  }, [post]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const dataWithSlug = {
        ...data,
        slug: isEdit ? post?.slug : generateSlug(data.title_en),
      };
      
      if (isEdit) {
        const { error } = await supabase
          .from("journal_posts" as any)
          .update(dataWithSlug as any)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("journal_posts" as any).insert([dataWithSlug as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-journal-posts"] });
      toast.success(isEdit ? "Article updated" : "Article created");
      navigate("/admin/journal");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save article");
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const dataToSave = {
        ...formData,
        slug: isEdit ? post?.slug : generateSlug(formData.title_en),
        status: "published" as const,
        published_at: new Date().toISOString(),
      };

      if (isEdit) {
        const { error } = await supabase
          .from("journal_posts" as any)
          .update(dataToSave as any)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("journal_posts" as any).insert([dataToSave as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-journal-posts"] });
      toast.success("Article published successfully");
      navigate("/admin/journal");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to publish article");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/journal">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Button>
        </Link>
        <div className="flex gap-2">
          {isEdit && post?.slug && (
            <Link to={`/journal/${post.slug}`} target="_blank">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            onClick={() => saveMutation.mutate(formData)}
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
            Publish
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Article" : "New Article"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Article Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Article Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stories">Stories</SelectItem>
                      <SelectItem value="Places">Places</SelectItem>
                      <SelectItem value="Guides">Guides</SelectItem>
                      <SelectItem value="People">People</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author_name">Author Name *</Label>
                  <Input
                    id="author_name"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <ImageUpload
                label="Cover Image"
                bucket="journal-images"
                value={formData.cover_image}
                onChange={(url) => setFormData({ ...formData, cover_image: url })}
                description="Main image for the article (appears in list and at the top of the post)"
              />
            </div>

            {/* Bilingual Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* English Version */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">English Version</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title_en">Title (EN) *</Label>
                  <Input
                    id="title_en"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt_en">Excerpt (EN)</Label>
                  <Textarea
                    id="excerpt_en"
                    value={formData.excerpt_en}
                    onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                    placeholder="Short introduction (will appear in article list)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content_en">Content (EN) *</Label>
                  <RichTextEditor
                    content={formData.content_en}
                    onChange={(content) => setFormData({ ...formData, content_en: content })}
                    placeholder="Write your article content here..."
                  />
                </div>
              </div>

              {/* Hebrew Version */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Hebrew Version</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title_he">Title (HE)</Label>
                  <Input
                    id="title_he"
                    value={formData.title_he}
                    onChange={(e) => setFormData({ ...formData, title_he: e.target.value })}
                    className="bg-[#EAF4FF]"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt_he">Excerpt (HE)</Label>
                  <Textarea
                    id="excerpt_he"
                    value={formData.excerpt_he}
                    onChange={(e) => setFormData({ ...formData, excerpt_he: e.target.value })}
                    placeholder="תיאור קצר (יופיע ברשימת המאמרים)"
                    rows={3}
                    className="bg-[#EAF4FF]"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content_he">Content (HE)</Label>
                  <RichTextEditor
                    content={formData.content_he}
                    onChange={(content) => setFormData({ ...formData, content_he: content })}
                    placeholder="כתוב את תוכן המאמר כאן..."
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className="space-y-4 p-6 bg-muted/30 rounded-lg border">
              <h3 className="text-lg font-semibold">SEO Settings</h3>
              <p className="text-sm text-muted-foreground">
                Optimize how this article appears in search engines and social media
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* English SEO */}
                <div className="space-y-4">
                  <h4 className="font-medium">English</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seo_title_en">SEO Title (EN)</Label>
                    <Input
                      id="seo_title_en"
                      value={formData.seo_title_en}
                      onChange={(e) => setFormData({ ...formData, seo_title_en: e.target.value })}
                      placeholder="Title for search engines"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description_en">Meta Description (EN)</Label>
                    <Textarea
                      id="meta_description_en"
                      value={formData.meta_description_en}
                      onChange={(e) => setFormData({ ...formData, meta_description_en: e.target.value })}
                      placeholder="Description for search results"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og_title_en">OG Title (EN)</Label>
                    <Input
                      id="og_title_en"
                      value={formData.og_title_en}
                      onChange={(e) => setFormData({ ...formData, og_title_en: e.target.value })}
                      placeholder="Title for social sharing"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og_description_en">OG Description (EN)</Label>
                    <Textarea
                      id="og_description_en"
                      value={formData.og_description_en}
                      onChange={(e) => setFormData({ ...formData, og_description_en: e.target.value })}
                      placeholder="Description for social sharing"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Hebrew SEO */}
                <div className="space-y-4">
                  <h4 className="font-medium">Hebrew</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seo_title_he">SEO Title (HE)</Label>
                    <Input
                      id="seo_title_he"
                      value={formData.seo_title_he}
                      onChange={(e) => setFormData({ ...formData, seo_title_he: e.target.value })}
                      placeholder="כותרת למנועי חיפוש"
                      className="bg-[#EAF4FF]"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description_he">Meta Description (HE)</Label>
                    <Textarea
                      id="meta_description_he"
                      value={formData.meta_description_he}
                      onChange={(e) => setFormData({ ...formData, meta_description_he: e.target.value })}
                      placeholder="תיאור לתוצאות חיפוש"
                      rows={3}
                      className="bg-[#EAF4FF]"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og_title_he">OG Title (HE)</Label>
                    <Input
                      id="og_title_he"
                      value={formData.og_title_he}
                      onChange={(e) => setFormData({ ...formData, og_title_he: e.target.value })}
                      placeholder="כותרת לשיתוף ברשתות"
                      className="bg-[#EAF4FF]"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og_description_he">OG Description (HE)</Label>
                    <Textarea
                      id="og_description_he"
                      value={formData.og_description_he}
                      onChange={(e) => setFormData({ ...formData, og_description_he: e.target.value })}
                      placeholder="תיאור לשיתוף ברשתות"
                      rows={3}
                      className="bg-[#EAF4FF]"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* French SEO */}
                <div className="space-y-4">
                  <h4 className="font-medium">French</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="seo_title_fr">SEO Title (FR)</Label>
                    <Input
                      id="seo_title_fr"
                      value={formData.seo_title_fr}
                      onChange={(e) => setFormData({ ...formData, seo_title_fr: e.target.value })}
                      placeholder="Titre pour les moteurs de recherche"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description_fr">Meta Description (FR)</Label>
                    <Textarea
                      id="meta_description_fr"
                      value={formData.meta_description_fr}
                      onChange={(e) => setFormData({ ...formData, meta_description_fr: e.target.value })}
                      placeholder="Description pour les résultats de recherche"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og_title_fr">OG Title (FR)</Label>
                    <Input
                      id="og_title_fr"
                      value={formData.og_title_fr}
                      onChange={(e) => setFormData({ ...formData, og_title_fr: e.target.value })}
                      placeholder="Titre pour le partage social"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og_description_fr">OG Description (FR)</Label>
                    <Textarea
                      id="og_description_fr"
                      value={formData.og_description_fr}
                      onChange={(e) => setFormData({ ...formData, og_description_fr: e.target.value })}
                      placeholder="Description pour le partage social"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <ImageUpload
                label="OG Image"
                bucket="journal-images"
                value={formData.og_image}
                onChange={(url) => setFormData({ ...formData, og_image: url })}
                description="Image for social media sharing (recommended: 1200x630px)"
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalEditor;
