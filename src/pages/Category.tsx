import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
  
  const { data: experiences, isLoading: experiencesLoading } = useQuery({
    queryKey: ["category-experiences", category?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select(`
          *,
          hotels (
            id,
            name,
            city,
            region
          )
        `)
        .eq("category_id", category?.id)
        .eq("status", "published");
      
      if (error) throw error;
      return data;
    },
    enabled: !!category?.id,
  });

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Category not found</p>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Category Hero */}
        <section className="relative h-[500px] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${category.hero_image || '/placeholder.svg'})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          
          <div className="relative z-10 container text-center text-white px-4">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              {category.name}
            </h1>
            {category.intro_rich_text && (
              <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
                {category.intro_rich_text}
              </p>
            )}
            
            {category.bullets && category.bullets.length === 3 && (
              <div className="flex flex-wrap justify-center gap-8 mt-12">
                {category.bullets.map((bullet, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-primary-glow">•</span>
                    <span className="text-lg">{bullet}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Experiences Grid */}
        <section className="container py-16">
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold mb-2">
              {experiences?.length || 0} Experience{experiences?.length !== 1 ? 's' : ''} Available
            </h2>
            <p className="text-muted-foreground">
              Discover extraordinary stays in this category
            </p>
          </div>

          {experiencesLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div>
          ) : !experiences || experiences.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No experiences found in this category yet.</p>
              <Button variant="outline" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {experiences.map((experience) => (
                <Link key={experience.id} to={`/experiences/${experience.slug}`}>
                  <Card className="overflow-hidden hover:shadow-strong transition-smooth h-full group">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={experience.hero_image || "/placeholder.svg"}
                        alt={experience.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-primary/90 text-white text-xs px-3 py-1 rounded-full">
                          {category.name}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-serif text-2xl font-bold mb-2">
                        {experience.title}
                      </h3>
                      {experience.subtitle && (
                        <p className="text-muted-foreground mb-4">
                          {experience.subtitle}
                        </p>
                      )}
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{experience.hotels?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{experience.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{experience.min_party}-{experience.max_party} guests</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-muted-foreground">From</span>
                          <span className="font-serif text-2xl font-bold text-primary">
                            ${experience.base_price}
                            <span className="text-sm text-muted-foreground font-normal">
                              {experience.base_price_type === "per_person" ? "/person" : ""}
                            </span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Category;