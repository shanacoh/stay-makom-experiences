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
import { toast } from "sonner";
import { ArrowLeft, Save, Eye } from "lucide-react";

const JournalEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = id && id !== "new";

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    cover_image: "",
    category: "Stories",
    excerpt: "",
    content: "",
    author_name: "STAYMAKOM",
    status: "draft",
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
        title: post.title,
        slug: post.slug,
        cover_image: post.cover_image || "",
        category: post.category,
        excerpt: post.excerpt || "",
        content: post.content,
        author_name: post.author_name,
        status: post.status,
      });
    }
  }, [post]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isEdit ? prev.slug : generateSlug(title),
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isEdit) {
        const { error } = await supabase
          .from("journal_posts" as any)
          .update(data as any)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("journal_posts" as any).insert([data as any]);
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
              <p className="text-sm text-muted-foreground">
                URL: /journal/{formData.slug || "your-slug"}
              </p>
            </div>

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

            <ImageUpload
              label="Cover Image"
              bucket="journal-images"
              value={formData.cover_image}
              onChange={(url) => setFormData({ ...formData, cover_image: url })}
              description="Main image for the article (appears in list and at the top of the post)"
            />

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Short introduction (will appear in article list)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your article content here..."
                rows={20}
                className="font-mono"
                required
              />
              <p className="text-sm text-muted-foreground">
                You can use HTML tags for formatting
              </p>
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalEditor;
