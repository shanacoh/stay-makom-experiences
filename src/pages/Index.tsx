import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import RotatingText from "@/components/RotatingText";
import ContactDialog from "@/components/ContactDialog";
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
import whyChooseUs from "@/assets/why-choose-us.jpg";
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
  const {
    data: categories,
    isLoading
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("categories").select("*").eq("status", "published").order("display_order", {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });
  const {
    data: latestExperiences,
    isLoading: isLoadingExperiences
  } = useQuery({
    queryKey: ["latest-experiences"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("experiences").select("*, hotels(name, city, region)").eq("status", "published").order("created_at", {
        ascending: false
      }).limit(3);
      if (error) throw error;
      return data;
    }
  });
  return <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-end">
          <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url(${heroImage})`
        }} />
          <div className="absolute inset-0 bg-black/30" />
          
          <div className="relative z-10 container text-left text-white px-4 sm:px-6 pb-8 sm:pb-12 md:pb-16 ml-0 sm:ml-4 md:ml-8 lg:ml-[1cm]">
            <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-6 tracking-[-0.02em] animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase max-w-5xl text-slate-50 pt-6">
              More than a stay,
              <br />
              it's a{" "}
              <RotatingText words={categories?.map(cat => cat.name) || ["Romance", "Adventure", "Family"]} interval={2500} />
            </h1>
            
            
          </div>
        </section>

        {/* Categories Section */}
        <section className="container py-12 sm:py-16 md:py-20 px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold tracking-[-0.02em] mb-4">DON'T CHOOSE A CITY<br />CHOOSE YOUR ESCAPE</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">From the desert to the sea, from vineyards to kibbutzim, (RE)discover Israel through experiences that feel like nowhere else. </p>
          </div>

          {isLoading ? <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div> : <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {categories?.map(category => <CategoryCard key={category.slug} title={category.name} description={category.intro_rich_text || ""} image={category.hero_image || fallbackImages[category.slug] || ""} slug={category.slug} />)}
            </div>}
        </section>

        {/* Hottest of the Season Section */}
        <section className="container py-12 sm:py-16 md:py-20 px-4">
          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-[-0.02em] mb-8 sm:mb-12">
            Hottest of the season
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
            <div className="rounded-2xl overflow-hidden">
              <img src={desertHotelPool} alt="Desert hotel with pool" className="w-full h-full object-cover" />
            </div>
            
            <div className="space-y-3 sm:space-y-4 lg:pl-8">
              <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-muted-foreground">
                DESERT MADNESS
              </p>
              <h3 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.02em]">
                40° of internal peace
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground">
                Check in, drop your bags and let the desert do the rest.
              </p>
              <Button size="lg" className="bg-black hover:bg-black/90 text-white mt-4 w-full sm:w-auto" onClick={() => {
              if (latestExperiences && latestExperiences.length > 0) {
                navigate(`/experience/${latestExperiences[0].slug}`);
              } else {
                navigate('/category/beyond-nature');
              }
            }}>
                Let the journey begin
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="container py-12 sm:py-16 md:py-20 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden h-[400px] lg:h-[500px]">
              <img 
                src={whyChooseUs} 
                alt="Exclusive experience" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Content */}
            <div className="space-y-6 lg:pl-8">
              <div className="flex items-center justify-center lg:justify-start">
                <div className="text-center lg:text-left">
                  <p className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground mb-2">
                    WHY CHOOSE US?
                  </p>
                  <div className="w-8 h-8 mx-auto lg:mx-0 border-2 border-foreground rounded-sm flex items-center justify-center">
                    <span className="text-lg">🏠</span>
                  </div>
                </div>
              </div>
              
              <p className="text-lg sm:text-xl leading-relaxed text-center lg:text-left">
                Exclusive access, unique experiences, places of character—unlock the door to Sesame and live extraordinary moments close to home: spa, brunch, pool, workshops, and so much more...
              </p>
              
              <div className="text-center lg:text-left">
                <Button 
                  variant="outline" 
                  className="uppercase tracking-wider font-medium"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Search by Mood Section */}
        <section className="container py-12 sm:py-16 md:py-20 px-4">
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-6">
              <button className="p-2 rounded-full border border-border hover:bg-accent transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="p-2 rounded-full border border-border hover:bg-accent transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-6 italic">
              Search by mood
            </h2>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mb-8">
              Whether it's a moment of relaxation in an exclusive spa, a gastronomic brunch, or discovering creative workshops, Sesame opens the door to a world of unexpected experiences.
            </p>
            
            <Button 
              size="lg" 
              className="bg-black hover:bg-black/90 text-white rounded-full px-8"
              onClick={() => navigate('/category/romantic')}
            >
              View All Experiences
            </Button>
          </div>

          {/* Mood Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { type: 'seaside', label: 'By the Sea', image: desertHotelPool, description: 'Ocean breeze and coastal elegance' },
              { type: 'mountains', label: 'Mountain Escapes', image: desertJourney, description: 'Fresh air and alpine serenity' },
              { type: 'desert', label: 'Desert Dreams', image: desertHero, description: 'Vast horizons and tranquil silence' },
              { type: 'city_break', label: 'City Breaks', image: desertKioskHero, description: 'Urban energy and cultural immersion' },
              { type: 'countryside', label: 'Countryside', image: natureImg, description: 'Rolling hills and peaceful nature' },
              { type: 'vineyard', label: 'Vineyards', image: tasteImg, description: 'Wine country and culinary delights' },
            ].map((mood) => (
              <div 
                key={mood.type}
                className="group cursor-pointer relative rounded-xl overflow-hidden h-[280px] sm:h-[320px]"
                onClick={() => {
                  // Will filter by region_type in the future
                  navigate('/category/romantic');
                }}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${mood.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium mb-2 italic">
                    {mood.label}
                  </h3>
                  <p className="text-sm text-white/90 uppercase tracking-wider">
                    {mood.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium uppercase tracking-wider">
                    Explore
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img src={desertJourney} alt="Desert journey" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
          </div>
          
          <div className="container max-w-6xl relative z-10 px-4">
            
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 md:gap-12">
              {/* Block 1 */}
              <div className="text-center space-y-3 sm:space-y-4 opacity-0 animate-fade-in-up" style={{
              animationDelay: '0.1s'
            }}>
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-medium text-white">
                  Follow what moves you
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-white/90 max-w-sm mx-auto px-4">
                  Explore experiences that speak to your mood — slow mornings in the desert, sunrise yoga, a hidden vineyard at dusk, or simply a moment to breathe.
                </p>
              </div>
              
              {/* Block 2 */}
              <div className="text-center space-y-3 sm:space-y-4 opacity-0 animate-fade-in-up" style={{
              animationDelay: '0.3s'
            }}>
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-medium text-white">
                  Shape your own moment
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-white/90 max-w-sm mx-auto px-4">
                  Choose your stay, then add the touches that make it uniquely yours — a private ritual, a tasting under the stars, or something beautifully unexpected.
                </p>
              </div>
              
              {/* Block 3 */}
              <div className="text-center space-y-3 sm:space-y-4 opacity-0 animate-fade-in-up" style={{
              animationDelay: '0.5s'
            }}>
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-medium text-white">
                  Book, unwind, begin
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-white/90 max-w-sm mx-auto px-4">
                  Secure your date and let the anticipation start. Your STAYMAKOM is waiting — quietly, gently, beautifully.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Experiences Section */}
        <section className="container py-8 sm:py-12 md:py-16 lg:py-20 px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
            <h2 className="font-sans text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold tracking-[-0.02em]">
              Latest Experiences
            </h2>
            <Button variant="link" className="text-foreground underline underline-offset-4 text-xs sm:text-sm md:text-base p-0 h-auto">
              View all experiences →
            </Button>
          </div>

          {isLoadingExperiences ? <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {latestExperiences?.map(experience => <div key={experience.id} className="group cursor-pointer" onClick={() => window.location.href = `/experience/${experience.slug}`}>
                  <div className="relative h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{
                backgroundImage: `url(${experience.hero_image || desertHotelPool})`
              }} />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-0 left-0 p-4 sm:p-6">
                      <h3 className="text-white font-bold text-xl sm:text-2xl md:text-3xl uppercase tracking-tight leading-tight">
                        {experience.title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <span>{experience.hotels?.city}</span>
                    </div>
                    
                    <h4 className="font-bold text-base sm:text-lg">
                      {experience.hotels?.name}
                    </h4>
                    
                    {experience.subtitle && <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {experience.subtitle}
                      </p>}
                    
                     <div className="flex items-baseline gap-2 pt-1">
                       <span className="font-bold text-lg sm:text-xl">
                         {experience.base_price}€
                       </span>
                       <span className="text-sm sm:text-base text-muted-foreground">
                         / {experience.base_price_type === 'per_person' ? 'person' : 'stay'}
                       </span>
                     </div>
                  </div>
                </div>)}
            </div>}
        </section>

        {/* Desert Kiosk Hero Section */}
        <section className="relative min-h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center">
          <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url(${desertKioskHero})`
        }} />
          <div className="absolute inset-0 bg-black/30" />
          
          <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto">
            <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.02em] mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase text-slate-50 lg:text-5xl">
              BECOME A PARTNER                                                                                
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 max-w-2xl mx-auto">
              If you want to be part of Staymakom’s curated selection, leave your info and we’ll get back to you shortly.
            </p>
            <Button size="lg" className="bg-white hover:bg-primary text-foreground hover:text-white uppercase tracking-wide font-medium rounded-none animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 text-xs sm:text-sm h-auto py-3 sm:py-4 px-6 sm:px-8" onClick={() => navigate('/category/beyond-nature')}>it's time to join the club</Button>
          </div>
        </section>
      </main>

      <Footer />
      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
    </div>;
};
export default Index;