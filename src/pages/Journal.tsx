import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";

const Journal = () => {
  const { lang } = useLanguage();
  const { data: posts, isLoading } = useQuery({
    queryKey: ["journal-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_posts" as any)
        .select("*")
        .eq("status", "published")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as any[];
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

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6">Journal</h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Stories, places, and insights from extraordinary stays across Israel
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-4 animate-pulse" />
                  <div className="h-6 bg-muted rounded mb-2 animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} to={`/journal/${post.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  {post.cover_image && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={`${getCategoryColor(post.category)} text-white`}>
                        {post.category}
                      </Badge>
                      {post.published_at && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(post.published_at), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                   <h3 className="font-serif text-2xl mb-2 line-clamp-2">
                      {getLocalizedField(post, "title", lang) || post.title_en}
                    </h3>
                    {(getLocalizedField(post, "excerpt", lang) || post.excerpt_en) && (
                      <p className="text-muted-foreground line-clamp-3">
                        {getLocalizedField(post, "excerpt", lang) || post.excerpt_en}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              No articles published yet. Check back soon!
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Journal;
