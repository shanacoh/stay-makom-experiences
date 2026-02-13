import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Loader2, ExternalLink, Star, DoorOpen, Home, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";
import LocationMap from "@/components/experience-test/LocationMap";

const Hotel2 = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();

  const { data: hotel, isLoading: hotelLoading } = useQuery({
    queryKey: ["hotel2", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels2")
        .select("*")
        .eq("slug", slug!)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch V2 experiences linked to this hotel via junction table
  const { data: experiences, isLoading: experiencesLoading } = useQuery({
    queryKey: ["hotel2-experiences", hotel?.id],
    queryFn: async () => {
      const { data: links, error: linksError } = await supabase
        .from("experience2_hotels")
        .select("experience_id")
        .eq("hotel_id", hotel!.id);

      if (linksError) throw linksError;
      if (!links || links.length === 0) return [];

      const ids = links.map((l: any) => l.experience_id);
      const { data, error } = await supabase
        .from("experiences2")
        .select("*")
        .in("id", ids)
        .eq("status", "published");

      if (error) throw error;
      return data || [];
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
          <p className="text-muted-foreground">{t(lang, 'hotelNotFound')}</p>
        </main>
        <Footer />
      </div>
    );
  }

  const hotelName = getLocalizedField(hotel, 'name', lang) as string || hotel.name;
  const city = getLocalizedField(hotel, 'city', lang) as string || hotel.city;
  const region = getLocalizedField(hotel, 'region', lang) as string || hotel.region;
  const story = getLocalizedField(hotel, 'story', lang) as string || hotel.story;
  const highlights = getLocalizedField(hotel, 'highlights', lang) as string[] || hotel.highlights;
  const amenities = getLocalizedField(hotel, 'amenities', lang) as string[] || hotel.amenities;

  const displayPhotos = hotel.photos && hotel.photos.length > 0
    ? hotel.photos.slice(0, 8)
    : [];

  const infoChips = [
    hotel.star_rating && { icon: Star, label: "★".repeat(hotel.star_rating) },
    hotel.property_type && { icon: Home, label: hotel.property_type },
    hotel.number_of_rooms && { icon: DoorOpen, label: `${hotel.number_of_rooms} rooms` },
    hotel.check_in_time && { icon: Clock, label: `Check-in ${hotel.check_in_time}` },
    hotel.check_out_time && { icon: Clock, label: `Check-out ${hotel.check_out_time}` },
  ].filter(Boolean) as { icon: any; label: string }[];

  return (
    <div className="min-h-screen flex flex-col" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <SEOHead
        titleEn={hotel.seo_title_en}
        titleHe={hotel.seo_title_he}
        descriptionEn={hotel.meta_description_en}
        descriptionHe={hotel.meta_description_he}
        ogTitleEn={hotel.og_title_en}
        ogTitleHe={hotel.og_title_he}
        ogDescriptionEn={hotel.og_description_en}
        ogDescriptionHe={hotel.og_description_he}
        ogImage={hotel.og_image || hotel.hero_image}
        fallbackTitle={`${hotelName} - ${city || ''} - StayMakom`}
        fallbackDescription={story?.substring(0, 155) || ""}
      />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div className="relative h-[500px]">
          <img
            src={hotel.hero_image || displayPhotos[0] || "/placeholder.svg"}
            alt={hotelName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          <div className="absolute bottom-0 left-0 right-0 container pb-12">
            <h1 className="font-sans text-5xl font-bold text-white mb-3">
              {hotelName}
            </h1>
            {(city || region) && (
              <p className="text-xl text-white/90 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {city}{city && region && ', '}{region}
              </p>
            )}
          </div>
        </div>

        {/* Info chips */}
        {infoChips.length > 0 && (
          <div className="container py-6">
            <div className="flex flex-wrap gap-3">
              {infoChips.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-sm font-medium"
                >
                  <chip.icon className="h-4 w-4 text-primary" />
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container py-16">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Story */}
              {story && (
                <div>
                  <h2 className="font-sans text-3xl font-bold mb-6">{t(lang, 'ourStory')}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                    {story}
                  </p>
                </div>
              )}

              {/* Highlights */}
              {highlights && highlights.length > 0 && (
                <div>
                  <h2 className="font-sans text-3xl font-bold mb-6">{t(lang, 'highlights')}</h2>
                  <ul className="space-y-3">
                    {highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-primary mt-1">•</span>
                        <span className="text-lg">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Amenities */}
              {amenities && amenities.length > 0 && (
                <div>
                  <h2 className="font-sans text-3xl font-bold mb-6">{t(lang, 'amenities')}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {amenities.map((amenity, index) => (
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
                  <h2 className="font-sans text-3xl font-bold mb-6">{t(lang, 'gallery')}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {displayPhotos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`${hotelName} - ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Map */}
              {hotel.latitude && hotel.longitude && (
                <LocationMap
                  latitude={hotel.latitude}
                  longitude={hotel.longitude}
                  hotelName={hotelName}
                  lang={lang}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Contact Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-sans text-xl font-bold">{t(lang, 'contact')}</h3>
                  {hotel.contact_email && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">{t(lang, 'email')}:</span>{" "}
                      <a href={`mailto:${hotel.contact_email}`} className="hover:underline">
                        {hotel.contact_email}
                      </a>
                    </p>
                  )}
                  {hotel.contact_phone && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">{t(lang, 'phone')}:</span>{" "}
                      <a href={`tel:${hotel.contact_phone}`} className="hover:underline">
                        {hotel.contact_phone}
                      </a>
                    </p>
                  )}
                  {hotel.contact_website && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={hotel.contact_website} target="_blank" rel="noopener noreferrer">
                        {t(lang, 'visitWebsite')}
                        <ExternalLink className="ms-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {hotel.contact_instagram && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={hotel.contact_instagram} target="_blank" rel="noopener noreferrer">
                        {t(lang, 'instagram')}
                        <ExternalLink className="ms-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* V2 Experiences at this hotel */}
              {!experiencesLoading && experiences && experiences.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-sans text-xl font-bold mb-4">{t(lang, 'experiences')}</h3>
                    <div className="space-y-3">
                      {experiences.map((exp) => {
                        const expTitle = getLocalizedField(exp, 'title', lang) as string || exp.title;
                        return (
                          <Link
                            key={exp.id}
                            to={`/experience2/${exp.slug}`}
                            className="block p-3 rounded-lg hover:bg-muted transition-colors"
                          >
                            <p className="font-medium">{expTitle}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {t(lang, 'fromPrice')} ${exp.base_price}
                              {exp.base_price_type === "per_person" && ` ${t(lang, 'perPersonLabel')}`}
                            </p>
                          </Link>
                        );
                      })}
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

export default Hotel2;
