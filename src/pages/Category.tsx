import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import CategoryFilters, { FilterState } from "@/components/category/CategoryFilters";
import ExperienceMap from "@/components/category/ExperienceMap";
import { useState, useMemo } from "react";
const Category = () => {
  const {
    slug
  } = useParams<{
    slug: string;
  }>();
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "recommended",
    priceRange: [0, 1000],
    partySize: 2
  });
  const {
    data: category,
    isLoading: categoryLoading
  } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("categories").select("*").eq("slug", slug).eq("status", "published").single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });
  const {
    data: experiences,
    isLoading: experiencesLoading
  } = useQuery({
    queryKey: ["category-experiences", category?.id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("experiences").select(`
          *,
          hotels (
            id,
            name,
            city,
            region,
            latitude,
            longitude
          )
        `).eq("category_id", category?.id).eq("status", "published");
      if (error) throw error;
      return data;
    },
    enabled: !!category?.id
  });
  const filteredExperiences = useMemo(() => {
    if (!experiences) return [];
    let filtered = [...experiences];

    // Filter by price
    filtered = filtered.filter(exp => {
      const price = Number(exp.base_price);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Filter by party size
    filtered = filtered.filter(exp => {
      return exp.min_party <= filters.partySize && exp.max_party >= filters.partySize;
    });

    // Sort
    switch (filters.sortBy) {
      case "price_asc":
        filtered.sort((a, b) => Number(a.base_price) - Number(b.base_price));
        break;
      case "price_desc":
        filtered.sort((a, b) => Number(b.base_price) - Number(a.base_price));
        break;
      default:
        break;
    }
    return filtered;
  }, [experiences, filters]);
  if (categoryLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>;
  }
  if (!category) {
    return <div className="min-h-screen flex flex-col">
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
      </div>;
  }
  return <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Immersive Hero Section */}
        <section className="relative h-[70vh] min-h-[600px] flex items-end">
          <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url(${category.hero_image || '/placeholder.svg'})`
        }} />
          
          <div className="relative z-10 container text-white px-4 py-12">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-end max-w-7xl mx-auto">
              {/* Left side - Category name and Title */}
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-widest text-white/90 font-bold">
                  {category.name}
                </p>
                <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight uppercase text-white">
                  {category.intro_rich_text?.split('.')[0] || category.name}
                </h1>
              </div>
              
              {/* Right side - Description only */}
              <div>
                <p className="text-lg md:text-xl leading-relaxed text-white">
                  {category.intro_rich_text}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <CategoryFilters onFilterChange={setFilters} onShowMapToggle={setShowMap} showMap={showMap} />

        {/* Experiences List with Optional Map */}
        <section className="container py-8">
          <div className={`grid ${showMap ? 'lg:grid-cols-[1fr_500px]' : 'grid-cols-1'} gap-8`}>
            {/* Experiences List */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">
                  {filteredExperiences.length} expérience{filteredExperiences.length !== 1 ? 's' : ''} disponible{filteredExperiences.length !== 1 ? 's' : ''}
                </h2>
                <p className="text-muted-foreground">
                  Découvrez des séjours extraordinaires
                </p>
              </div>

              {experiencesLoading ? <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                </div> : filteredExperiences.length === 0 ? <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Aucune expérience ne correspond à vos critères.</p>
                  <Button variant="outline" onClick={() => setFilters({
                sortBy: "recommended",
                priceRange: [0, 1000],
                partySize: 2
              })}>
                    Réinitialiser les filtres
                  </Button>
                </div> : <div className="space-y-6">
                  {filteredExperiences.map(experience => <Link key={experience.id} to={`/experiences/${experience.slug}`}>
                      <Card className="overflow-hidden hover:shadow-strong transition-smooth group">
                        <div className="grid md:grid-cols-[300px_1fr] gap-6">
                          <div className="relative overflow-hidden aspect-[4/3] md:aspect-auto">
                            <img src={experience.hero_image || "/placeholder.svg"} alt={experience.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                          <CardContent className="p-6 flex flex-col justify-between">
                            <div>
                              <h3 className="font-serif text-2xl font-bold mb-2">
                                {experience.title}
                              </h3>
                              {experience.subtitle && <p className="text-muted-foreground mb-4">
                                  {experience.subtitle}
                                </p>}
                              
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{experience.hotels?.name} • {experience.hotels?.city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{experience.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  <span>{experience.min_party}-{experience.max_party} personnes</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm text-muted-foreground">À partir de</span>
                                <span className="font-serif text-3xl font-bold text-primary">
                                  ${experience.base_price}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {experience.base_price_type === "per_person" ? "/pers" : ""}
                                </span>
                              </div>
                              <Button variant="outline">Voir les détails</Button>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>)}
                </div>}
            </div>

            {/* Map */}
            {showMap && <div className="hidden lg:block">
                <ExperienceMap experiences={filteredExperiences} />
              </div>}
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default Category;