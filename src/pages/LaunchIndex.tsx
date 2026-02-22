import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { t } from "@/lib/translations";
import Header from "@/components/Header";
import LaunchFooter from "@/components/LaunchFooter";
import { SEOHead } from "@/components/SEOHead";
import MarqueeBanner from "@/components/MarqueeBanner";
import HowItWorksBanner from "@/components/HowItWorksBanner";
import CategoryCard from "@/components/CategoryCard";
import ExperienceCard from "@/components/ExperienceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription } from
"@/components/ui/dialog";
import { Loader2, ArrowRight, Gift, CheckCircle, Compass, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import heroImage from "@/assets/hero-image-new.jpg";
import handpickedHero from "@/assets/handpicked-hero.jpg";
import giftCardHero from "@/assets/gift-card-hero.jpg";
import romanticImg from "@/assets/romantic-category.jpg";
import activeImg from "@/assets/active-category.jpg";

/* ─── Filter button slugs ─── */
const FILTER_ADVENTURE = "adventure";
const FILTER_ROMANTIC = "romantic";
const LaunchIndex = () => {
  const { lang } = useLanguage();
  const { getLocalizedPath } = useLocalizedNavigation();
  const isRTL = lang === "he";

  // Lead capture state
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<string | null>(FILTER_ADVENTURE);

  // Waitlist popup state
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistCategory, setWaitlistCategory] = useState<string>("");
  const [waitlistCategoryId, setWaitlistCategoryId] = useState<string>("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["launch-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.
      from("categories").
      select("*").
      eq("status", "published").
      order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Fetch published experiences2 with hotels
  const { data: experiences2, isLoading: isLoadingExp } = useQuery({
    queryKey: ["launch-experiences2"],
    queryFn: async () => {
      const { data, error } = await supabase.
      from("experiences2").
      select(`
          *,
          categories(slug),
          experience2_hotels(
            position,
            nights,
            hotel:hotels2(
              id, name, name_he, city, city_he, region, region_he, hero_image
            )
          ),
          experience2_highlight_tags(
            highlight_tags(
              id, slug, label_en, label_he
            )
          )
        `).
      eq("status", "published").
      order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Resolve category id from slug
  const getCategoryIdFromSlug = (slug: string) =>
  categories?.find((c) => c.slug === slug)?.id;

  // Filtered experiences
  const filteredExperiences = activeFilter === FILTER_ROMANTIC ?
  experiences2?.filter((exp: any) => exp.categories?.slug === "romantic") :
  activeFilter === FILTER_ADVENTURE ?
  experiences2?.filter((exp: any) => exp.categories?.slug !== "romantic") :
  experiences2;

  // Lead capture handler
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("collect-lead", {
        body: { email, source: "coming_soon" }
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

  // Waitlist handler
  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || waitlistSubmitting) return;
    setWaitlistSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("collect-lead", {
        body: {
          email: waitlistEmail,
          source: "category_waitlist",
          cta_id: waitlistCategoryId,
          metadata: { category_name: waitlistCategory }
        }
      });
      if (error) throw error;
      setWaitlistSubmitted(true);
      setWaitlistEmail("");
      toast.success(isRTL ? "נרשמת בהצלחה!" : "You're on the list!");
    } catch {
      toast.error(isRTL ? "שגיאה, נסה שנית" : "Something went wrong.");
    } finally {
      setWaitlistSubmitting(false);
    }
  };

  // Handle category card click → open waitlist popup
  const handleCategoryClick = (category: any) => {
    const name = getLocalizedField(category, "name", lang) as string;
    setWaitlistCategory(name);
    setWaitlistCategoryId(category.id);
    setWaitlistSubmitted(false);
    setWaitlistEmail("");
    setWaitlistOpen(true);
  };

  // Handle filter button click
  const handleFilterClick = (slug: string) => {
    setActiveFilter((prev) => prev === slug ? null : slug);
  };

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <SEOHead
        title="STAYMAKOM — Handpicked Hotels & Experiences in Israel"
        description="We curate Israel's best boutique hotels and pair them with unique local experiences." />

      <Header />

      <main className="flex-1">
        {/* ─── 1. HERO ─── */}
        <section className="relative h-[70vh] min-h-[480px] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }} />

          <div className="absolute inset-0 bg-black/45" />

          <div className="relative z-10 text-center text-white px-6 max-w-3xl mx-auto">
            <h1
              className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-[-0.02em] leading-[1.1] mb-4 opacity-0 animate-hero-fade-up text-white"
              style={{ animationDelay: '0ms' }}>

              Don't choose a city,
              <br />
              choose your escape
            </h1>
            <p
              className="text-base sm:text-lg text-white/90 font-light mb-7 max-w-xl mx-auto opacity-0 animate-hero-fade-up md:text-base"
              style={{ animationDelay: '250ms' }}>

              We curate Israel's best hotels and pair them with unique local
              experiences.
            </p>
            <button
              onClick={() => {
                const el = document.getElementById("launch-experiences");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-10 py-4 bg-white text-foreground font-semibold uppercase tracking-wide text-sm rounded-md shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-white/90 transition-all duration-300 opacity-0 animate-hero-fade-up"
              style={{ animationDelay: '500ms' }}>

              Find your experience & hotel
            </button>
          </div>
        </section>

        {/* ─── 1b. HOW IT WORKS BANNER ─── */}
        <HowItWorksBanner />

        {/* ─── 2. HANDPICKED + TOGGLE + GRID ─── */}
        <section id="launch-experiences" className="container sm:py-8 md:py-10 px-4 scroll-mt-16 py-[26px]">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-[-0.02em] mb-1.5 leading-tight">
              Handpicked Hotels.
              <br />
              Unforgettable Experiences.
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mb-5">
              For 24 hours, 48 hours, or tailor-made experiences.
            </p>

            {/* Compact pill toggle */}
            <div className="inline-flex items-center bg-muted/50 rounded-full p-1 border border-border/50">
              <button
                onClick={() => setActiveFilter(FILTER_ADVENTURE)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                  activeFilter === FILTER_ADVENTURE ?
                  "bg-white shadow-sm text-foreground" :
                  "text-muted-foreground hover:text-foreground"
                )}>

                <Compass size={15} />
                Feel adventurous
              </button>
              <button
                onClick={() => setActiveFilter(FILTER_ROMANTIC)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                  activeFilter === FILTER_ROMANTIC ?
                  "bg-white shadow-sm text-foreground" :
                  "text-muted-foreground hover:text-foreground"
                )}>

                <Heart size={15} />
                Romantic getaway
              </button>
            </div>
          </div>

          {isLoadingExp ?
          <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div> :
          filteredExperiences && filteredExperiences.length > 0 ?
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 transition-all duration-500">
              {filteredExperiences.map((experience: any) => {
              const primaryHotelLink = experience.experience2_hotels?.
              sort(
                (a: any, b: any) =>
                (a.position || 0) - (b.position || 0)
              )?.[
              0]?.hotel;

              const cardExperience = {
                ...experience,
                hotels: primaryHotelLink || null,
                experience_highlight_tags: experience.experience2_highlight_tags || []
              };

              return (
                <ExperienceCard
                  key={experience.id}
                  experience={cardExperience}
                  linkPrefix="/experience2" />);


            })}
            </div> :

          <div className="text-center py-16">
              <p className="text-muted-foreground">
                {isRTL ?
              "אין חוויות בקטגוריה זו עדיין" :
              "No experiences in this category yet."}
              </p>
              <button
              onClick={() => setActiveFilter(null)}
              className="mt-4 text-sm underline underline-offset-4 text-primary hover:text-primary/80">

                {isRTL ? "הצג הכל" : "Show all experiences"}
              </button>
            </div>
          }
        </section>

        {/* ─── 4. MARQUEE BANNER ─── */}
        <MarqueeBanner />

        {/* ─── 5. BRAND STATEMENT IMAGE BLOCK ─── */}
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

        {/* ─── 6. GIFT CARD ─── */}
        <section className="container py-10 md:py-14 px-4">
          <div className={`grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto ${isRTL ? "md:grid-flow-col-dense" : ""}`}>

            <div
              className={`relative overflow-hidden rounded-2xl ${
              isRTL ? "md:order-2" : ""}`
              }>

              <img
                src={giftCardHero}
                alt="Gift Card"
                className="w-full h-56 md:h-72 object-cover hover:scale-105 transition-transform duration-500" />

            </div>

            <div className={`space-y-4 ${isRTL ? "text-right md:order-1" : ""}`}>
              <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold tracking-[-0.02em] leading-tight">
                Perfect gift.
                <br />
                The gift of escape.
              </h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-md">
                {t(lang, "giftCardSectionDesc")}
              </p>
              <Button asChild className="group">
                <Link to={getLocalizedPath("/gift-card")}>
                  {t(lang, "giftCardSectionCTA")}
                  <ArrowRight
                    className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                    isRTL ?
                    "mr-2 rotate-180 group-hover:-translate-x-1" :
                    "ml-2"}`
                    } />

                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ─── 7. MORE EXPERIENCES + CATEGORIES (unified) ─── */}
        <section className="py-12 sm:py-16 bg-muted/50">
          <div className="container px-4 mx-auto">
            <div className="max-w-2xl mx-auto text-center mb-3">
              <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold tracking-[-0.02em] uppercase">
                {isRTL ? "עוד חוויות בדרך" : "More experiences are on the way."}
              </h2>
            </div>

            <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
              <p className="text-muted-foreground text-sm whitespace-nowrap">
                {isRTL ? "היו הראשונים לדעת." : "Be the first to know."}
              </p>

              {submitted ?
              <div className="flex items-center gap-2 text-primary font-medium">
                  <CheckCircle className="h-5 w-5" />
                  {isRTL ? "נרשמת בהצלחה!" : "You're on the list!"}
                </div> :

              <form onSubmit={handleLeadSubmit} className="flex gap-2 w-full sm:w-auto">
                  <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isRTL ? "כתובת האימייל שלך" : "Your email address"}
                  className="flex-1 sm:w-56" />

                  <Button type="submit" disabled={isSubmitting}>
                    {isRTL ? "עדכנו אותי" : "Notify me"}
                  </Button>
                </form>
              }
            </div>

            {!isLoadingCategories && categories && categories.length > 0 &&
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {categories.map((category) => {
                  const catTitle = getLocalizedField(category, "name", lang) as string;
                  const image = category.hero_image || "";
                  const words = catTitle.split(" ");
                  const midpoint = Math.ceil(words.length / 2);
                  const line1 = words.slice(0, midpoint).join(" ");
                  const line2 = words.slice(midpoint).join(" ");

                  return (
                    <button
                      key={`waitlist-${category.slug}`}
                      onClick={() => handleCategoryClick(category)}
                      className="group relative overflow-hidden rounded-xl shadow-soft hover:shadow-strong transition-all duration-300 text-left cursor-pointer">

                        <div className="aspect-square relative">
                          <img
                          src={image}
                          alt={catTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center p-4">
                            <h3 className="font-sans text-xl md:text-2xl font-bold text-white text-center uppercase tracking-tight">
                              <span className="block">{line1}</span>
                              {line2 && <span className="block -mt-1.5">{line2}</span>}
                            </h3>
                          </div>
                        </div>
                      </button>);

                })}
                </div>
              </div>
            }
          </div>
        </section>
      </main>

      <LaunchFooter />

      {/* ─── WAITLIST POPUP ─── */}
      <Dialog
        open={waitlistOpen}
        onOpenChange={(open) => {
          setWaitlistOpen(open);
          if (!open) setWaitlistSubmitted(false);
        }}>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sans text-xl font-bold tracking-[-0.02em]">
              {isRTL ?
              "החוויה הזו בדרך" :
              "This experience is coming soon."}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isRTL ?
              `הצטרף לרשימת ההמתנה של "${waitlistCategory}" והיה הראשון לדעת.` :
              `Join the waitlist for "${waitlistCategory}" and be the first to access it.`}
            </DialogDescription>
          </DialogHeader>

          {waitlistSubmitted ?
          <div className="flex items-center justify-center gap-2 text-primary font-medium py-6">
              <CheckCircle className="h-5 w-5" />
              {isRTL ? "נרשמת בהצלחה!" : "You're on the list!"}
            </div> :

          <form
            onSubmit={handleWaitlistSubmit}
            className="flex flex-col gap-3 pt-2">

              <Input
              type="email"
              required
              value={waitlistEmail}
              onChange={(e) => setWaitlistEmail(e.target.value)}
              placeholder={
              isRTL ? "כתובת האימייל שלך" : "Your email address"
              } />

              <Button type="submit" disabled={waitlistSubmitting} className="w-full">
                {waitlistSubmitting ?
              <Loader2 className="h-4 w-4 animate-spin" /> :
              isRTL ?
              "עדכנו אותי" :

              "Notify me — be the first to know"
              }
              </Button>
            </form>
          }
        </DialogContent>
      </Dialog>
    </div>);

};

export default LaunchIndex;