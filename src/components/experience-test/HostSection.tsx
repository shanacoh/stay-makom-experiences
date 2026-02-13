import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, ExternalLink } from "lucide-react";
import { getLocalizedField, type Language } from "@/hooks/useLanguage";

interface Hotel {
  id: string;
  name: string;
  name_he?: string;
  slug: string;
  story?: string;
  story_he?: string;
  hero_image?: string;
  city?: string;
  city_he?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_instagram?: string;
}

interface HostSectionProps {
  hotel: Hotel | null;
  lang?: Language;
}

const HostSection = ({ hotel, lang = "en" }: HostSectionProps) => {
  if (!hotel) return null;

  const name = getLocalizedField(hotel, "name", lang) as string || hotel.name;
  const story = getLocalizedField(hotel, "story", lang) as string || hotel.story;
  const city = getLocalizedField(hotel, "city", lang) as string || hotel.city;

  // Truncate story if too long
  const truncatedStory = story && story.length > 300 
    ? story.substring(0, 300) + "..." 
    : story;

  return (
    <section className="py-8 border-b border-border">
      <h2 className="text-2xl font-bold mb-6">
        {lang === "he" ? "על המארח" : lang === "en" ? "About your host" : "À propos de votre hôte"}
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Host/Hotel image */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/20">
            <img
              src={hotel.hero_image || "/placeholder.svg"}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Host info */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1">{name}</h3>
          {city && (
            <p className="text-muted-foreground text-sm mb-3">{city}</p>
          )}

          {truncatedStory && (
            <p className="text-muted-foreground leading-relaxed mb-4">
              {truncatedStory}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Link to={`/hotel2/${hotel.slug}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                {lang === "he" ? "צפה בפרופיל" : lang === "en" ? "View profile" : "Voir le profil"}
              </Button>
            </Link>

            {hotel.contact_email && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.location.href = `mailto:${hotel.contact_email}`}
              >
                <MessageCircle className="h-4 w-4" />
                {lang === "he" ? "שלח הודעה" : lang === "en" ? "Send message" : "Envoyer un message"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HostSection;
