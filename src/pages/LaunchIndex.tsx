import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import HowItWorksBanner from "@/components/HowItWorksBanner";
import ExperienceCard from "@/components/ExperienceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import heroImage from "@/assets/desert-hero.jpg";

const LaunchIndex = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "he";
  const gridRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch published experiences2 with hotels2
  const { data: experiences, isLoading } = useQuery({
    queryKey: ["launch-experiences2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences2")
        .select("*, hotels2(*), categories(*)")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("collect-lead", {
        body: { email, source: "coming_soon" },
      });
      if (error) throw error;
      setSubmitted(true);
      setEmail("");
      toast.success(
        isRTL ? "נרשמת בהצלחה!" : "You're on the list!"
      );
    } catch {
      toast.error(isRTL ? "שגיאה, נסה שנית" : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const texts = {
    en: {
      heroTitle: "Handpicked hotels.\nUnforgettable experiences.",
      heroSub: "We curate Israel's best boutique hotels and pair them with unique local experiences.",
      cta: "Explore experiences",
      gridTitle: "Our Experiences",
      comingTitle: "More experiences are on the way",
      comingSub: "Be the first to know when new destinations and experiences launch.",
      notify: "Notify me",
      emailPlaceholder: "Your email address",
      subscribed: "You're on the list!",
    },
    he: {
      heroTitle: "מלונות בוטיק נבחרים.\nחוויות בלתי נשכחות.",
      heroSub: "אנחנו אוצרים את מלונות הבוטיק הטובים בישראל ומשלבים אותם עם חוויות מקומיות ייחודיות.",
      cta: "גלו את החוויות",
      gridTitle: "החוויות שלנו",
      comingTitle: "עוד חוויות בדרך",
      comingSub: "היו הראשונים לדעת כשיעדים וחוויות חדשים מושקים.",
      notify: "עדכנו אותי",
      emailPlaceholder: "כתובת האימייל שלך",
      subscribed: "נרשמת בהצלחה!",
    },
  };

  const t = texts[lang === "he" ? "he" : "en"];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background">
      <SEOHead
        title="STAYMAKOM — Handpicked Hotels & Experiences in Israel"
        description="We curate Israel's best boutique hotels and pair them with unique local experiences."
      />
      <Header />

      {/* ───── HERO ───── */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="Desert landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight whitespace-pre-line mb-6">
            {t.heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-white/85 mb-10 max-w-xl mx-auto">
            {t.heroSub}
          </p>
          <Button
            onClick={scrollToGrid}
            variant="cta"
            size="lg"
            className="text-base px-8 py-6 gap-2"
          >
            {t.cta}
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ───── EXPERIENCES GRID ───── */}
      <section ref={gridRef} className="py-16 sm:py-20 bg-background">
        <div className="container px-4">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground text-center mb-10">
            {t.gridTitle}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences?.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  experience={{
                    ...exp,
                    hotels: exp.hotels2,
                  }}
                  linkPrefix="/experience2"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <HowItWorksBanner />

      {/* ───── COMING SOON + LEAD CAPTURE ───── */}
      <section className="py-16 sm:py-20 bg-muted/50">
        <div className="container px-4 max-w-lg mx-auto text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
            {t.comingTitle}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t.comingSub}
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-primary font-medium">
              <CheckCircle className="h-5 w-5" />
              {t.subscribed}
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="flex gap-2">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="flex-1"
              />
              <Button type="submit" variant="cta" disabled={isSubmitting}>
                {t.notify}
              </Button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LaunchIndex;
