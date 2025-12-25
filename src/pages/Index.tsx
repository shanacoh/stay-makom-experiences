import { Button } from "@/components/ui/button";
import { Loader2, Heart, Users, Sparkles, Leaf, Wine, Zap, Laptop, Brain, Mountain, Utensils, Plane, Camera, Music, Book, Coffee, Sun, Moon, Star, Compass, Map, Globe, Briefcase, Award, Gift, Gem, Crown, Shield, Flame, Droplet, Wind, Cloud, TreePine, Flower2, type LucideIcon } from "lucide-react";

// Icon mapping for dynamic category icons
const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  users: Users,
  sparkles: Sparkles,
  leaf: Leaf,
  wine: Wine,
  zap: Zap,
  laptop: Laptop,
  brain: Brain,
  mountain: Mountain,
  utensils: Utensils,
  plane: Plane,
  camera: Camera,
  music: Music,
  book: Book,
  coffee: Coffee,
  sun: Sun,
  moon: Moon,
  star: Star,
  compass: Compass,
  map: Map,
  globe: Globe,
  briefcase: Briefcase,
  award: Award,
  gift: Gift,
  gem: Gem,
  crown: Crown,
  shield: Shield,
  flame: Flame,
  droplet: Droplet,
  wind: Wind,
  cloud: Cloud,
  "tree-pine": TreePine,
  flower: Flower2
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import RotatingText from "@/components/RotatingText";
import ContactDialog from "@/components/ContactDialog";
import ExperienceCard from "@/components/ExperienceCard";
import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";
import { SEOHead } from "@/components/SEOHead";
import JournalSection from "@/components/JournalSection";
import AIExperienceAssistant from "@/components/AIExperienceAssistant";
import StickyAIButton from "@/components/StickyAIButton";
import heroImage from "@/assets/hero-image-new.jpg";
import desertHero from "@/assets/desert-hero.jpg";
import desertKioskHero from "@/assets/desert-kiosk-hero.png";
import desertHotelPool from "@/assets/desert-hotel-pool.jpg";
import desertJourney from "@/assets/desert-journey.jpg";
import romanticImg from "@/assets/romantic-category.jpg";
import familyImg from "@/assets/family-category.jpg";
import goldenAgeImg from "@/assets/golden-age-category.jpg";
import natureImg from "@/assets/nature-category.jpg";
import tasteImg from "@/assets/taste-category.jpg";
import activeImg from "@/assets/active-category.jpg";
import handpickedHero from "@/assets/handpicked-hero.jpg";

const fallbackImages: Record<string, string> = {
  "romantic": romanticImg,
  "family": familyImg,
  "golden-age": goldenAgeImg,
  "beyond-nature": natureImg,
  "taste-affair": tasteImg,
  "active-break": activeImg
};

const Index = () => {
  const navigate = useNavigate();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { lang } = useLanguage();
  const carouselRef = useRef<HTMLDivElement>(null);
  const latestCarouselRef = useRef<HTMLDivElement>(null);
  const isRTL = lang === 'he';

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("status", "published")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  const { data: latestExperiences, isLoading: isLoadingExperiences } = useQuery({
    queryKey: ["latest-experiences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*, hotels(name, name_he, city, city_he, region, hero_image)")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    }
  });

  const { data: allExperiences, isLoading: isLoadingAllExperiences } = useQuery({
    queryKey: ["all-experiences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*, hotels(name, name_he, city, city_he, region, hero_image), experience_reviews(rating)")
        .eq("status", "published");
      if (error) throw error;
      return data;
    }
  });

  // Fetch homepage SEO settings
  const { data: homepageSEO } = useQuery({
    queryKey: ["homepage-seo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_settings")
        .select("*")
        .eq("key", "homepage")
        .single();
      if (error) throw error;
      return data;
    }
  });

  const filteredExperiences = selectedCategoryId
    ? allExperiences?.filter(exp => exp.category_id === selectedCategoryId)
        .sort((a, b) => {
          const avgRatingA = a.experience_reviews?.length
            ? a.experience_reviews.reduce((sum, r) => sum + r.rating, 0) / a.experience_reviews.length
            : 0;
          const avgRatingB = b.experience_reviews?.length
            ? b.experience_reviews.reduce((sum, r) => sum + r.rating, 0) / b.experience_reviews.length
            : 0;
          return avgRatingB - avgRatingA;
        })
        .slice(0, 4)
    : latestExperiences?.slice(0, 8);

  const selectedCategory = categories?.find(cat => cat.id === selectedCategoryId);

  // Auto-scroll for carousel
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel || !filteredExperiences || filteredExperiences.length === 0) return;

    const scrollInterval = setInterval(() => {
      const scrollAmount = carousel.scrollLeft + (carousel.offsetWidth * 0.75 + 12);
      const maxScroll = carousel.scrollWidth - carousel.offsetWidth;
      if (scrollAmount >= maxScroll - 10) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carousel.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, [filteredExperiences]);

  // Auto-scroll for latest experiences carousel
  useEffect(() => {
    const carousel = latestCarouselRef.current;
    if (!carousel || !latestExperiences || latestExperiences.length === 0) return;

    const scrollInterval = setInterval(() => {
      const scrollAmount = carousel.scrollLeft + (carousel.offsetWidth * 0.75 + 12);
      const maxScroll = carousel.scrollWidth - carousel.offsetWidth;
      if (scrollAmount >= maxScroll - 10) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carousel.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      }
    }, 3000);
    return () => clearInterval(scrollInterval);
  }, [latestExperiences]);

  // Category display names mapping
  const getCategoryDisplay = (slug: string) => {
    const displayMap: Record<string, string> = {
      'romantic': lang === 'he' ? t(lang, 'categoryRomantic') : t('en', 'categoryRomantic'),
      'family': lang === 'he' ? t(lang, 'categoryFamily') : t('en', 'categoryFamily'),
      'golden-age': lang === 'he' ? t(lang, 'categoryGoldenAge') : t('en', 'categoryGoldenAge'),
      'nature': lang === 'he' ? t(lang, 'categoryNature') : t('en', 'categoryNature'),
      'beyond-nature': lang === 'he' ? t(lang, 'categoryNature') : t('en', 'categoryNature'),
      'taste': lang === 'he' ? t(lang, 'categoryTaste') : t('en', 'categoryTaste'),
      'taste-affair': lang === 'he' ? t(lang, 'categoryTaste') : t('en', 'categoryTaste'),
      'active': lang === 'he' ? t(lang, 'categoryActive') : t('en', 'categoryActive'),
      'active-break': lang === 'he' ? t(lang, 'categoryActive') : t('en', 'categoryActive'),
      'work-unplugged': lang === 'he' ? t(lang, 'categoryWorkUnplugged') : t('en', 'categoryWorkUnplugged'),
      'mindful-reset': lang === 'he' ? t(lang, 'categoryMindfulReset') : t('en', 'categoryMindfulReset'),
    };
    return displayMap[slug] || slug;
  };

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEOHead
        titleEn={homepageSEO?.seo_title_en}
        titleHe={homepageSEO?.seo_title_he}
        descriptionEn={homepageSEO?.meta_description_en}
        descriptionHe={homepageSEO?.meta_description_he}
        ogTitleEn={homepageSEO?.og_title_en}
        ogTitleHe={homepageSEO?.og_title_he}
        ogDescriptionEn={homepageSEO?.og_description_en}
        ogDescriptionHe={homepageSEO?.og_description_he}
        ogImage={homepageSEO?.og_image}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center md:items-end md:justify-start">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
          
          <div className={`relative z-10 container text-white px-4 sm:px-6 pb-8 md:pb-16 flex flex-col items-center text-center md:items-start md:text-left ${isRTL ? 'md:mr-0 md:mr-4 lg:mr-[1cm] md:text-right' : 'md:ml-0 md:ml-4 lg:ml-[1cm] md:text-left'}`}>
            <h1 className="font-sans text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 tracking-[-0.02em] animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase max-w-5xl text-slate-50 pt-6">
              {/* Mobile: "MORE THAN A STAY, IT'S A" on one line */}
              <span className="md:hidden">
                {t(lang, 'heroTitle1')} {t(lang, 'heroTitle2')}
              </span>
              {/* Desktop: original layout with line break */}
              <span className="hidden md:inline">
                {t(lang, 'heroTitle1')}
                <br />
                {t(lang, 'heroTitle2')}{" "}
              </span>
              {/* Rotating category - on its own line on mobile */}
              <span className="block md:inline">
                <RotatingText
                  words={categories?.map(cat => getLocalizedField(cat, 'name', lang) as string) || ["Romance", "Adventure", "Family"]}
                  interval={2500}
                />
              </span>
            </h1>
            <button
              onClick={() => {
                const element = document.getElementById('choose-escape');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-4 sm:mt-6 px-6 sm:px-8 py-3 sm:py-4 bg-white text-foreground font-semibold uppercase tracking-wide text-sm sm:text-base rounded-md hover:bg-white/90 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"
            >
              {t(lang, 'heroCTA')}
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('ai-assistant');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-3 text-white/90 text-sm font-medium hover:text-white transition-colors duration-300 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 group"
            >
              <span className="relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1px] after:bottom-0 after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 group-hover:after:scale-x-100 group-hover:after:origin-bottom-left">
                {t(lang, 'heroAIHelp')}
              </span>
            </button>
          </div>
        </section>

        {/* Categories Section */}
        <section id="choose-escape" className="container py-6 sm:py-8 md:py-10 px-4 scroll-mt-20">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="font-sans text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-[-0.02em] mb-2">
              {t(lang, 'chooseCityTitle')}<br />{t(lang, 'chooseEscapeTitle')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              {t(lang, 'chooseCitySubtitle')}
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {categories?.map(category => (
                <CategoryCard key={category.slug} category={category} />
              ))}
            </div>
          )}
        </section>

        {/* AI Experience Assistant */}
        <AIExperienceAssistant />

        {/* Handpicked Hotels Hero Section */}
        <section className="relative py-14 sm:py-18 md:py-24 overflow-hidden">
          <div className="absolute inset-0">
            <img src={handpickedHero} alt="Israeli countryside road" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          <div className="container max-w-3xl relative z-10 px-4 text-center">
            <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.02em] mb-4 text-white">
              {t(lang, 'handpickedTitle1')}<br />
              {t(lang, 'handpickedTitle2')}
            </h2>
            <div className="text-xs sm:text-sm md:text-base leading-relaxed text-white/95 max-w-2xl mx-auto space-y-3">
              <p>{t(lang, 'handpickedP1')}</p>
              <p>{t(lang, 'handpickedP2')}</p>
              <p>{t(lang, 'handpickedP3')}</p>
            </div>
          </div>
        </section>

        {/* Category Experiences Section */}
        <section className="container py-12 sm:py-16 md:py-20 px-4">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-muted-foreground mb-2">
              {t(lang, 'yourExperiences')}
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium mb-8 sm:mb-12">
              {t(lang, 'followHeart')}
            </h2>
            
            {/* Category Tabs */}
            {!isLoading && categories && (
              <div className={`flex flex-nowrap justify-start sm:justify-center gap-1 sm:gap-3 mb-6 sm:mb-12 overflow-x-auto overflow-y-visible py-2 px-2 sm:px-0 -mx-4 sm:mx-0 scrollbar-hide ${isRTL ? 'flex-row-reverse' : ''}`}>
                {categories.map(category => (
                  <button
                    key={category.slug}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer flex-shrink-0 w-14 sm:w-20 transition-all ${selectedCategoryId === category.id ? 'text-primary scale-105' : ''}`}
                  >
                    {/* Icon with circular hover background */}
                    <div className={`p-2 sm:p-3 rounded-full transition-all group-hover:bg-muted ${selectedCategoryId === category.id ? 'bg-primary/10' : ''}`}>
                      {(() => {
                        const IconComponent = category.icon ? iconMap[category.icon] : null;
                        return IconComponent ? (
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                        ) : (
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                        );
                      })()}
                    </div>
                    
                    {/* 2-line text with fixed height */}
                    <span className={`text-[10px] sm:text-xs font-medium uppercase tracking-wide text-center h-7 sm:h-8 leading-[14px] sm:leading-4 whitespace-pre-line transition-colors ${selectedCategoryId === category.id ? 'text-primary' : 'group-hover:text-primary'}`}>
                      {getCategoryDisplay(category.slug)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Experiences Grid/Carousel */}
          {isLoadingExperiences || isLoadingAllExperiences ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <>
              {/* Mobile & Tablet Carousel */}
              <div className="lg:hidden relative mb-8">
                <div ref={carouselRef} className="overflow-x-auto -mx-4 px-4 snap-x snap-mandatory scroll-smooth scrollbar-hide">
                  <div className="flex gap-3 pb-4">
                    {[...(filteredExperiences || []), ...(filteredExperiences || [])].map((experience, index) => (
                      <div key={`${experience.id}-${index}`} className="flex-shrink-0 w-[75vw] md:w-[30vw] snap-center">
                        <ExperienceCard
                          experience={experience}
                          rating={8.5 + Math.random() * 0.5}
                          reviewCount={50 + Math.floor(Math.random() * 950)}
                        />
                      </div>
                    ))}
                    {selectedCategoryId && filteredExperiences && filteredExperiences.length < 4 &&
                      Array.from({ length: 4 - filteredExperiences.length }).map((_, idx) => (
                        <div key={`empty-${idx}`} className="flex-shrink-0 w-[75vw] md:w-[30vw] snap-center invisible"></div>
                      ))
                    }
                  </div>
                </div>
              </div>

              {/* Desktop Grid */}
              <div className="hidden lg:grid lg:grid-cols-4 gap-2 md:gap-3 mb-8">
                {filteredExperiences?.map(experience => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    rating={8.5 + Math.random() * 0.5}
                    reviewCount={50 + Math.floor(Math.random() * 950)}
                  />
                ))}
                {selectedCategoryId && filteredExperiences && filteredExperiences.length < 4 &&
                  Array.from({ length: 4 - filteredExperiences.length }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="invisible"></div>
                  ))
                }
              </div>

            </>
          )}

          {/* Single Dynamic CTA */}
          <div className="text-center mt-8">
            <Button
              asChild
              size="lg"
              className="bg-black hover:bg-black/90 text-white rounded-full px-8"
            >
              <Link to={selectedCategoryId && selectedCategory 
                ? `/category/${selectedCategory.slug}${lang === 'he' ? '?lang=he' : ''}` 
                : `/experiences${lang === 'he' ? '?lang=he' : ''}`
              }>
                {selectedCategoryId && selectedCategory 
                  ? `${t(lang, 'viewMoreOf')} ${getLocalizedField(selectedCategory, 'name', lang)}`
                  : t(lang, 'viewAllExperiences')
                }
              </Link>
            </Button>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative py-10 sm:py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0">
            <img src={desertJourney} alt="Desert journey" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
          </div>
          
          <div className="container max-w-5xl relative z-10 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
              {/* Block 1 */}
              <div className="text-center space-y-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <span className="font-serif text-4xl sm:text-5xl md:text-6xl text-white/80 font-light">1</span>
                <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-medium text-white">{t(lang, 'step1')}</h3>
              </div>
              
              {/* Block 2 */}
              <div className="text-center space-y-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <span className="font-serif text-4xl sm:text-5xl md:text-6xl text-white/80 font-light">2</span>
                <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-medium text-white">{t(lang, 'step2')}</h3>
              </div>
              
              {/* Block 3 */}
              <div className="text-center space-y-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <span className="font-serif text-4xl sm:text-5xl md:text-6xl text-white/80 font-light">3</span>
                <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-medium text-white">{t(lang, 'step3')}</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Experiences Section */}
        <section className="container py-8 sm:py-12 md:py-16 lg:py-20 px-4">
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <h2 className="font-sans text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold tracking-[-0.02em]">
              {t(lang, 'latestExperiences')}
            </h2>
            <Button variant="link" className="text-foreground underline underline-offset-4 text-xs sm:text-sm p-0 h-auto">
              {t(lang, 'viewAllExperiencesLink')}
            </Button>
          </div>

          {isLoadingExperiences ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <>
              {/* Mobile & Tablet Carousel */}
              <div className="lg:hidden relative">
                <div ref={latestCarouselRef} className="overflow-x-auto -mx-4 px-4 snap-x snap-mandatory scroll-smooth scrollbar-hide">
                  <div className="flex gap-3 pb-4">
                    {[...(latestExperiences || []), ...(latestExperiences || [])].map((experience, index) => (
                      <div key={`${experience.id}-${index}`} className="flex-shrink-0 w-[75vw] md:w-[30vw] snap-center">
                        <ExperienceCard
                          experience={experience}
                          badge="NEW"
                          rating={8.5 + Math.random() * 0.5}
                          reviewCount={50 + Math.floor(Math.random() * 950)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop Grid */}
              <div className="hidden lg:grid lg:grid-cols-4 gap-2 md:gap-3">
                {latestExperiences?.map(experience => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    badge="NEW"
                    rating={8.5 + Math.random() * 0.5}
                    reviewCount={50 + Math.floor(Math.random() * 950)}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Journal Section */}
        <JournalSection lang={lang} />

        {/* Desert Kiosk Hero Section */}
        <section className="relative min-h-[280px] sm:h-[320px] md:h-[380px] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${desertKioskHero})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
          
          <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-3xl mx-auto">
            <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold tracking-[-0.02em] mb-3 sm:mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase text-slate-50 lg:text-4xl">
              {t(lang, 'becomePartner')}
            </h2>
            <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 max-w-xl mx-auto">
              {t(lang, 'partnerDescription')}
            </p>
            <Button
              size="default"
              className="bg-white hover:bg-primary text-foreground hover:text-white uppercase tracking-wide font-medium rounded-none animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 text-xs sm:text-sm h-auto py-2.5 sm:py-3 px-5 sm:px-6"
              onClick={() => navigate('/category/beyond-nature')}
            >
              {t(lang, 'joinClub')}
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <StickyAIButton />
      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
    </div>
  );
};

export default Index;
