import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock, Loader2, Heart, Star } from "lucide-react";
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
    priceRange: [0, 10000],
    partySize: 1
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
            longitude,
            hero_image
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

    // Filter by price only if not at max range
    if (filters.priceRange[1] < 10000) {
      filtered = filtered.filter(exp => {
        const price = Number(exp.base_price);
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
    }

    // Filter by party size only if greater than 1
    if (filters.partySize > 1) {
      filtered = filtered.filter(exp => {
        return exp.min_party <= filters.partySize && exp.max_party >= filters.partySize;
      });
    }

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
                <h1 className="font-sans text-5xl font-bold leading-tight uppercase text-white md:text-4xl">
                  {(category as any).presentation_title || category.name}
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
        <CategoryFilters onFilterChange={setFilters} onShowMapToggle={setShowMap} showMap={showMap} className="my-0" />

        {/* Experiences List with Optional Map */}
        <section className="container py-8">
          <div className={`grid ${showMap ? 'lg:grid-cols-[1fr_500px]' : 'grid-cols-1'} gap-8`}>
            {/* Experiences List */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-1">
                  {filteredExperiences.length} experience{filteredExperiences.length !== 1 ? 's' : ''} available
                </h2>
                <p className="text-muted-foreground">
                  Discover extraordinary stays
                </p>
              </div>

              {experiencesLoading ? <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                </div> : filteredExperiences.length === 0 ? <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No experiences match your criteria.</p>
                  <Button variant="outline" onClick={() => setFilters({
                sortBy: "recommended",
                priceRange: [0, 10000],
                partySize: 1
              })}>
                    Reset filters
                  </Button>
                </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExperiences.map(experience => {
                const originalPrice = Number(experience.base_price);
                const discountPercent = Math.floor(Math.random() * 30) + 10; // 10-40% discount
                const discountedPrice = Math.floor(originalPrice * (1 - discountPercent / 100));
                const rating = (Math.random() * 0.5 + 8.5).toFixed(1); // 8.5-9.0
                const reviewCount = Math.floor(Math.random() * 1000) + 50;
                return <Link key={experience.id} to={`/experience/${experience.slug}`} className="group">
                        <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
                          {/* Image with overlay title and heart */}
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <img src={experience.hero_image || experience.hotels?.hero_image || "/placeholder.svg"} alt={experience.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {/* Title overlay */}
                            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
                              <h3 className="font-sans text-2xl font-bold text-white uppercase tracking-tight">
                                {experience.title}
                              </h3>
                            </div>
                            {/* Heart icon */}
                            <button className="absolute top-4 right-4 p-2 rounded-full bg-background/80 hover:bg-background transition-colors" onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}>
                              <Heart className="h-5 w-5" />
                            </button>
                          </div>

                          {/* Card content */}
                          <CardContent className="p-4 space-y-2">
                            {/* Location and rating */}
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {experience.hotels?.city} • {experience.hotels?.region}
                              </span>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-semibold">{rating}</span>
                                <span className="text-muted-foreground">({reviewCount})</span>
                              </div>
                            </div>

                            {/* Hotel name */}
                            <h4 className="font-bold text-foreground leading-tight line-clamp-1">
                              {experience.hotels?.name}
                            </h4>

                            {/* Amenities/includes */}
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {experience.includes && experience.includes.length > 0 ? experience.includes.slice(0, 3).join(' • ') : `${experience.min_nights}-${experience.max_nights} nights • ${experience.min_party}-${experience.max_party} guests`}
                            </p>

                            {/* Price */}
                            <div className="flex items-baseline gap-2 pt-1">
                              <span className="font-bold text-lg">
                                ${discountedPrice}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                ${originalPrice}
                              </span>
                              <span className="text-sm font-medium">
                                / {experience.base_price_type === "per_person" ? "nuit" : "nuit"} 
                              </span>
                              <span className="text-sm font-semibold text-primary ml-auto">
                                -{discountPercent} %
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>;
              })}
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