import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const categoryNames: Record<string, string> = {
  romantic: "Romantic",
  family: "Family",
  "golden-age": "Golden Age",
  "beyond-nature": "Beyond Nature",
  "taste-affair": "Taste Affair",
  "active-break": "Active Break",
};

const categoryDescriptions: Record<string, string> = {
  romantic: "Intimate moments and unforgettable experiences designed for couples",
  family: "Adventures and memories for the whole family to cherish",
  "golden-age": "Curated comfort and sophistication for mature travelers",
  "beyond-nature": "Immersive outdoor experiences in stunning natural landscapes",
  "taste-affair": "Culinary journeys with master chefs and authentic local flavors",
  "active-break": "Energizing activities and wellness adventures to revitalize",
};

const Category = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const categoryKey = slug?.replace("-", "_") as "romantic" | "family" | "golden_age" | "beyond_nature" | "taste_affair" | "active_break";
  
  const { data: experiences, isLoading } = useQuery({
    queryKey: ["experiences", categoryKey],
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
        .eq("category", categoryKey)
        .eq("status", "published");
      
      if (error) throw error;
      return data;
    },
    enabled: !!categoryKey,
  });

  const categoryTitle = categoryNames[slug || ""] || "Experiences";
  const categoryDescription = categoryDescriptions[slug || ""] || "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Banner */}
        <section className="bg-gradient-hero py-20 text-white">
          <div className="container">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
              {categoryTitle}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              {categoryDescription}
            </p>
          </div>
        </section>

        {/* Experiences Grid */}
        <section className="container py-16">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading experiences...</p>
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
                  <Card className="overflow-hidden hover:shadow-strong transition-smooth h-full">
                    <div className="aspect-[4/3] relative">
                      <img
                        src={experience.hero_image || "/placeholder.svg"}
                        alt={experience.title}
                        className="w-full h-full object-cover"
                      />
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
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{experience.hotels?.city}, {experience.hotels?.region}</span>
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
                      
                      <div className="mt-4 pt-4 border-t border-border">
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