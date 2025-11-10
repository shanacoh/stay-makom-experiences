import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hotel = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: hotel, isLoading: hotelLoading } = useQuery({
    queryKey: ["hotel", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels")
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
    queryKey: ["hotel-experiences", hotel?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("hotel_id", hotel?.id)
        .eq("status", "published");

      if (error) throw error;
      return data;
    },
    enabled: !!hotel?.id,
  });

  if (hotelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Hotel not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const displayPhotos = hotel.photos && hotel.photos.length > 0 
    ? hotel.photos.slice(0, 6) 
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div className="relative h-[500px]">
          <img
            src={hotel.hero_image || displayPhotos[0] || "/placeholder.svg"}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          <div className="absolute bottom-0 left-0 right-0 container pb-12">
            <h1 className="font-serif text-5xl font-bold text-white mb-3">
              {hotel.name}
            </h1>
            {(hotel.city || hotel.region) && (
              <p className="text-xl text-white/90 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {hotel.city}, {hotel.region}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="container py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Story */}
              {hotel.story && (
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-6">Our Story</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                    {hotel.story}
                  </p>
                </div>
              )}

              {/* Highlights */}
              {hotel.highlights && hotel.highlights.length > 0 && (
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-6">Highlights</h2>
                  <ul className="space-y-3">
                    {hotel.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-lg">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-6">Amenities</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {hotel.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-primary">✓</span>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Gallery */}
              {displayPhotos.length > 0 && (
                <div>
                  <h2 className="font-serif text-3xl font-bold mb-6">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {displayPhotos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`${hotel.name} - ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Contact Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-serif text-xl font-bold">Contact</h3>
                  {hotel.contact_email && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Email:</span>{" "}
                      <a href={`mailto:${hotel.contact_email}`} className="hover:underline">
                        {hotel.contact_email}
                      </a>
                    </p>
                  )}
                  {hotel.contact_phone && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Phone:</span>{" "}
                      <a href={`tel:${hotel.contact_phone}`} className="hover:underline">
                        {hotel.contact_phone}
                      </a>
                    </p>
                  )}
                  {hotel.contact_website && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={hotel.contact_website} target="_blank" rel="noopener noreferrer">
                        Visit Website
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {hotel.contact_instagram && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={hotel.contact_instagram} target="_blank" rel="noopener noreferrer">
                        Instagram
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Experiences at this hotel */}
              {!experiencesLoading && experiences && experiences.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-serif text-xl font-bold mb-4">Experiences</h3>
                    <div className="space-y-3">
                      {experiences.map((exp) => (
                        <Link 
                          key={exp.id} 
                          to={`/experiences/${exp.slug}`}
                          className="block p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                          <p className="font-medium">{exp.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            From ${exp.base_price}
                            {exp.base_price_type === "per_person" && " per person"}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Hotel;
