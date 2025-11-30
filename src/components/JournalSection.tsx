import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalizedField, Language } from "@/hooks/useLanguage";
import { format } from "date-fns";

interface JournalSectionProps {
  lang: Language;
}

const JournalSection = ({ lang }: JournalSectionProps) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["journal-posts-homepage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_posts")
        .select("*")
        .eq("status", "published")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Stories: "bg-amber-100 text-amber-800",
      Places: "bg-emerald-100 text-emerald-800",
      Guides: "bg-blue-100 text-blue-800",
      People: "bg-purple-100 text-purple-800",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  if (isLoading) {
    return (
      <section className="container py-16 sm:py-20 md:py-24 px-4">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </div>
      </section>
    );
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <section className="bg-muted/30 py-16 sm:py-20 md:py-24">
      <div className="container px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 sm:mb-12 gap-4">
          <div>
            <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-muted-foreground mb-2">
              THE JOURNAL
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
              Stories & Discoveries
            </h2>
          </div>
          <Button
            asChild
            variant="ghost"
            className="group text-foreground hover:text-primary -ml-4 sm:ml-0"
          >
            <Link to={`/journal${lang === "he" ? "?lang=he" : ""}`}>
              View all articles
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Featured Post - Large Card */}
          <Link
            to={`/journal/${featuredPost.slug}${lang === "he" ? "?lang=he" : ""}`}
            className="group relative overflow-hidden rounded-2xl bg-background shadow-sm hover:shadow-lg transition-shadow duration-300"
          >
            <div className="aspect-[4/3] overflow-hidden">
              {featuredPost.cover_image ? (
                <img
                  src={featuredPost.cover_image}
                  alt={getLocalizedField(featuredPost, "title", lang) as string}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
              )}
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                    featuredPost.category
                  )}`}
                >
                  {featuredPost.category}
                </span>
                {featuredPost.published_at && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(featuredPost.published_at), "MMM d, yyyy")}
                  </span>
                )}
              </div>
              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-medium mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {getLocalizedField(featuredPost, "title", lang) as string}
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base line-clamp-3 leading-relaxed">
                {getLocalizedField(featuredPost, "excerpt", lang) as string}
              </p>
            </div>
          </Link>

          {/* Other Posts - Stacked Cards */}
          <div className="flex flex-col gap-6">
            {otherPosts.map((post) => (
              <Link
                key={post.id}
                to={`/journal/${post.slug}${lang === "he" ? "?lang=he" : ""}`}
                className="group flex gap-4 sm:gap-6 bg-background rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 rounded-lg overflow-hidden">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={getLocalizedField(post, "title", lang) as string}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
                  )}
                </div>
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${getCategoryColor(
                        post.category
                      )}`}
                    >
                      {post.category}
                    </span>
                    {post.published_at && (
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {format(new Date(post.published_at), "MMM d")}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-base sm:text-lg md:text-xl font-medium group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {getLocalizedField(post, "title", lang) as string}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 hidden sm:block">
                    {getLocalizedField(post, "excerpt", lang) as string}
                  </p>
                </div>
              </Link>
            ))}

            {/* If only 1 other post, add a CTA card */}
            {otherPosts.length === 1 && (
              <Link
                to={`/journal${lang === "he" ? "?lang=he" : ""}`}
                className="group flex items-center justify-center gap-3 bg-primary/5 hover:bg-primary/10 rounded-xl p-8 transition-colors duration-300 border-2 border-dashed border-primary/20"
              >
                <span className="text-lg font-medium text-primary">
                  Explore more stories
                </span>
                <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JournalSection;
