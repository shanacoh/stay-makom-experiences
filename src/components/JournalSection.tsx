import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalizedField, Language } from "@/hooks/useLanguage";

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
      <section className="container py-6 sm:py-8 px-4">
        <div className="text-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </div>
      </section>
    );
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="bg-muted/30 py-6 sm:py-8">
      <div className="container px-4">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-sans text-lg sm:text-xl font-bold tracking-tight uppercase">
            The Journal
          </h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="group text-foreground hover:text-primary text-xs"
          >
            <Link to={`/journal${lang === "he" ? "?lang=he" : ""}`}>
              View all
              <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Horizontal Card Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/journal/${post.slug}${lang === "he" ? "?lang=he" : ""}`}
              className="group flex sm:flex-col gap-3 bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex-shrink-0 w-20 h-20 sm:w-full sm:h-auto sm:aspect-[16/10] overflow-hidden">
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
              <div className="flex flex-col justify-center sm:p-3 pr-3 py-2 sm:py-0">
                <span
                  className={`self-start px-1.5 py-0.5 text-[9px] font-medium rounded mb-1 ${getCategoryColor(
                    post.category
                  )}`}
                >
                  {post.category}
                </span>
                <h3 className="font-medium text-xs sm:text-sm group-hover:text-primary transition-colors line-clamp-2">
                  {getLocalizedField(post, "title", lang) as string}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JournalSection;
