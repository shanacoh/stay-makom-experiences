import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { t } from "@/lib/translations";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import HowItWorksBanner from "@/components/HowItWorksBanner";
import MarqueeBanner from "@/components/MarqueeBanner";
import RotatingText from "@/components/RotatingText";
import CategoryCard from "@/components/CategoryCard";
import ExperienceCard from "@/components/ExperienceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, Gift, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import heroImage from "@/assets/hero-image-new.jpg";
import handpickedHero from "@/assets/handpicked-hero.jpg";
import giftCardHero from "@/assets/gift-card-hero.jpg";

const LaunchIndex = () => {
  const { lang } = useLanguage();
  const { getLocalizedPath } = useLocalizedNavigation();
  const isRTL = lang === "he";
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["launch-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("status", "published")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch published experiences2 with hotels2
  const { data: experiences2, isLoading: isLoadingExp } = useQuery({
    queryKey: ["launch-experiences2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences2")
        .select(`
          *,
          experience2_hotels(
            position,
            nights,
            hotel:hotels2(
              id, name, name_he, city, city_he, region, region_he, hero_image
            )
          )
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

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
      toast.success(isRTL ? "נרשמת בהצלחה!" : "You're on the list!");
    } catch {
      toast.error(isRTL ? "שגיאה, נסה שנית" : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <SEOHead
        title="STAYMAKOM — Handpicked Hotels & Experiences in Israel"
        description="We curate Israel's best boutique hotels and pair them with unique local experiences."
      />
      <Header />

      <main className="flex-1">
        {/* ───── HERO (copied from Index.tsx) ───── */}
        <section className="relative h-[80vh] min-h-[450px] flex items-center justify-center md:items-end md:justify-start">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-black/30" />

          <div className={`relative z-10 container text-white px-4 sm:px-6 pb-6 md:pb-12 flex flex-col items-center text-center md:items-start md:text-left ${isRTL ? 'md:mr-0 md:mr-4 lg:mr-[1cm] md:text-right' : 'md:ml-0 md:ml-4 lg:ml-[1cm] md:text-left'}`}>
            <h1 className="font-sans text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 tracking-[-0.02em] animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase max-w-4xl text-slate-50 pt-4">
              <span className="md:hidden">
                {t(lang, 'heroTitle1')} {t(lang, 'heroTitle2')}
              </span>
              <span className="hidden md:inline">
                {t(lang, 'heroTitle1')}
                <br />
                {t(lang, 'heroTitle2')}{" "}
              </span>
              <span className="block md:inline">
                <RotatingText
                  words={categories?.map(cat => getLocalizedField(cat, 'name', lang) as string) || ["Romance", "Adventure", "Family"]}
                  interval={2500}
                />
              </span>
            </h1>
            <button
              onClick={() => {
                const element = document.getElementById('launch-choose-escape');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-3 sm:mt-4 px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-foreground font-semibold uppercase tracking-wide text-xs sm:text-sm rounded-md hover:bg-white/90 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"
            >
              {t(lang, 'heroCTA')}
            </button>
          </div>
        </section>

        {/* ───── HOW IT WORKS ───── */}
        <HowItWorksBanner />

        {/* ───── CATEGORIES "Choose your escape" ───── */}
        <section id="launch-choose-escape" className="container py-4 sm:py-6 md:py-8 px-4 scroll-mt-16">
          <div className="text-center mb-3 sm:mb-4">
            <h2 className="font-sans text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-[-0.02em] mb-1.5">
              {t(lang, 'chooseCityTitle')}<br />{t(lang, 'chooseEscapeTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              {t(lang, 'chooseCitySubtitle')}
            </p>
          </div>

          {isLoadingCategories ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                {categories?.map(category => (
                  <CategoryCard key={category.slug} category={category} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ───── MARQUEE BANNER ───── */}
        <MarqueeBanner />

        {/* ───── HANDPICKED HOTELS ───── */}
        <section className="relative py-10 sm:py-14 md:py-18 overflow-hidden">
          <div className="absolute inset-0">
            <img src={handpickedHero} alt="Israeli countryside road" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="container max-w-3xl relative z-10 px-4 text-center">
            <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold tracking-[-0.02em] mb-3 text-white">
              {t(lang, 'handpickedTitle1')}<br />
              {t(lang, 'handpickedTitle2')}
            </h2>
            <div className="text-[11px] sm:text-xs md:text-sm leading-relaxed text-white/95 max-w-2xl mx-auto space-y-2">
              <p>{t(lang, 'handpickedP1')}</p>
              <p>{t(lang, 'handpickedP2')}</p>
              <p>{t(lang, 'handpickedP3')}</p>
            </div>
          </div>
        </section>

        {/* ───── EXPERIENCES2 GRID ───── */}
        <section className="container py-8 sm:py-12 md:py-16 px-4">
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <h2 className="font-sans text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold tracking-[-0.02em]">
              {lang === 'he' ? 'חוויות חדשות' : 'New Experiences'}
            </h2>
            <Button variant="link" asChild className="text-foreground underline underline-offset-4 text-xs sm:text-sm p-0 h-auto">
              <Link to={`/experiences2${lang === 'he' ? '?lang=he' : ''}`}>
                {lang === 'he' ? 'צפו בכולן' : 'View all'}
              </Link>
            </Button>
          </div>

          {isLoadingExp ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div>
          ) : experiences2 && experiences2.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
              {experiences2.map((experience: any) => {
                const primaryHotelLink = experience.experience2_hotels
                  ?.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
                  ?.[0]?.hotel;

                const cardExperience = {
                  ...experience,
                  hotels: primaryHotelLink || null,
                };

                return (
                  <ExperienceCard
                    key={experience.id}
                    experience={cardExperience}
                    linkPrefix="/experience2"
                  />
                );
              })}
            </div>
          ) : null}
        </section>

        {/* ───── GIFT CARD ───── */}
        <section className="container py-12 md:py-16 px-4">
          <div className={`grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto ${isRTL ? 'md:grid-flow-col-dense' : ''}`}>
            <div className={`relative overflow-hidden rounded-2xl ${isRTL ? 'md:order-2' : ''}`}>
              <img
                src={giftCardHero}
                alt="Gift Card"
                className="w-full h-64 md:h-80 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className={`space-y-4 ${isRTL ? 'text-right md:order-1' : ''}`}>
              <div className={`inline-flex items-center gap-2 text-primary ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Gift className="h-5 w-5" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  {t(lang, 'giftCardSectionTag')}
                </span>
              </div>
              <h2 className="font-sans text-2xl md:text-3xl font-bold tracking-[-0.02em]">
                {t(lang, 'giftCardSectionTitle')}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                {t(lang, 'giftCardSectionDesc')}
              </p>
              <Button asChild className="group">
                <Link to={getLocalizedPath('/gift-card')}>
                  {t(lang, 'giftCardSectionCTA')}
                  <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'mr-2 rotate-180 group-hover:-translate-x-1' : 'ml-2'}`} />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ───── COMING SOON + LEAD CAPTURE ───── */}
        <section className="py-12 sm:py-16 bg-muted/50">
          <div className="container px-4 max-w-lg mx-auto text-center">
            <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold tracking-[-0.02em] mb-3">
              {isRTL ? 'עוד חוויות בדרך' : 'More experiences are on the way'}
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              {isRTL
                ? 'היו הראשונים לדעת כשיעדים וחוויות חדשים מושקים.'
                : 'Be the first to know when new destinations and experiences launch.'}
            </p>

            {submitted ? (
              <div className="flex items-center justify-center gap-2 text-primary font-medium">
                <CheckCircle className="h-5 w-5" />
                {isRTL ? 'נרשמת בהצלחה!' : "You're on the list!"}
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="flex gap-2">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRTL ? 'כתובת האימייל שלך' : 'Your email address'}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isRTL ? 'עדכנו אותי' : 'Notify me'}
                </Button>
              </form>
            )}
          </div>
        </section>

        {/* ───── BOTTOM CATEGORIES GRID ───── */}
        {!isLoadingCategories && categories && categories.length > 0 && (
          <section className="container py-8 sm:py-12 md:py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                {categories.map(category => (
                  <CategoryCard key={`bottom-${category.slug}`} category={category} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LaunchIndex;
