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

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[350px] sm:min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1920&q=80" 
            alt="Journal" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-6 animate-fade-in max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold">
            Journal
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-100 mt-4">
            Stories, places, and insights from extraordinary stays across Israel
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-12">

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-3 bg-muted rounded mb-3 animate-pulse" />
                  <div className="h-5 bg-muted rounded mb-2 animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getCategoryColor(post.category)} text-white text-xs`}>
                        {post.category}
                      </Badge>
                      {post.published_at && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(post.published_at), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                    <h3 className="font-serif text-lg mb-1 line-clamp-2">
                      {getLocalizedField(post, "title", lang) || post.title_en}
                    </h3>
                    {(getLocalizedField(post, "excerpt", lang) || post.excerpt_en) && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {getLocalizedField(post, "excerpt", lang) || post.excerpt_en}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-base text-muted-foreground">
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