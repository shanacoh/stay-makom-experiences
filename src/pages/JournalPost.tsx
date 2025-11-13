import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import NotFound from "./NotFound";

const JournalPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["journal-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .not("published_at", "is", null)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      Stories: "bg-[#D72638]",
      Places: "bg-amber-500",
      Guides: "bg-blue-500",
      People: "bg-green-500",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="h-8 bg-muted rounded w-32 mb-8 animate-pulse" />
          <div className="h-12 bg-muted rounded mb-4 animate-pulse" />
          <div className="h-6 bg-muted rounded w-48 mb-8 animate-pulse" />
          <div className="aspect-[16/9] bg-muted rounded mb-12 animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-20">
        <Link to="/journal">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Button>
        </Link>

        <article>
          <div className="flex items-center gap-3 mb-6">
            <Badge className={`${getCategoryColor(post.category)} text-white`}>
              {post.category}
            </Badge>
            {post.published_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.published_at), "MMMM d, yyyy")}
              </div>
            )}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">
            {post.title}
          </h1>

          {post.author_name && (
            <p className="text-lg text-muted-foreground mb-12">
              By {post.author_name}
            </p>
          )}

          {post.cover_image && (
            <div className="aspect-[16/9] rounded-lg overflow-hidden mb-12">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {post.excerpt && (
            <div className="text-xl leading-relaxed mb-8 text-muted-foreground font-serif">
              {post.excerpt}
            </div>
          )}

          <div
            className="prose prose-lg max-w-none"
            style={{
              fontSize: "1.125rem",
              lineHeight: "1.75rem",
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="whitespace-pre-wrap"
            />
          </div>
        </article>

        <div className="mt-16 pt-8 border-t">
          <Link to="/journal">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              More Stories
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JournalPost;
