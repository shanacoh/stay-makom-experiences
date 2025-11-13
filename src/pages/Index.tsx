import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import RotatingText from "@/components/RotatingText";
import ContactDialog from "@/components/ContactDialog";
import heroImage from "@/assets/hero-image-new.jpg";
import desertHero from "@/assets/desert-hero.jpg";
import desertHotelPool from "@/assets/desert-hotel-pool.jpg";
import desertJourney from "@/assets/desert-journey.jpg";
import romanticImg from "@/assets/romantic-category.jpg";
import familyImg from "@/assets/family-category.jpg";
import goldenAgeImg from "@/assets/golden-age-category.jpg";
import natureImg from "@/assets/nature-category.jpg";
import tasteImg from "@/assets/taste-category.jpg";
import activeImg from "@/assets/active-category.jpg";
const fallbackImages: Record<string, string> = {
  "romantic": romanticImg,
  "family": familyImg,
  "golden-age": goldenAgeImg,
  "beyond-nature": natureImg,
  "taste-affair": tasteImg,
  "active-break": activeImg
};
const Index = () => {
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
        <section className="relative h-[600px] md:h-[700px] flex items-end">
          <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url(${heroImage})`
        }} />
          <div className="absolute inset-0 bg-black/30" />
          
          <div className="relative z-10 container text-left text-white px-4 pb-12 md:pb-16 ml-2 sm:ml-4 md:ml-8 lg:ml-[1cm]">
            <h1 className="font-sans text-4xl lg:text-7xl font-bold mb-6 tracking-[-0.02em] animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase max-w-5xl text-slate-50 md:text-5xl pt-6">
              More than a stay,
              <br />
              it's a{" "}
              <RotatingText words={categories?.map(cat => cat.name) || ["Romance", "Adventure", "Family"]} interval={2500} />
            </h1>
            
            
          </div>
        </section>

        {/* Categories Section */}
        <section className="container py-20">
          <div className="text-center mb-12">
            <h2 className="font-sans text-4xl font-bold tracking-[-0.02em] mb-4 md:text-6xl">DON'T CHOOSE A CITY<br />CHOOSE YOUR ESCAPE</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">From the desert to the sea, from vineyards to kibbutzim, (RE)discover Israel through experiences that feel like nowhere else. </p>
          </div>

          {isLoading ? <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div> : <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {categories?.map(category => <CategoryCard key={category.slug} title={category.name} description={category.intro_rich_text || ""} image={category.hero_image || fallbackImages[category.slug] || ""} slug={category.slug} />)}
            </div>}
        </section>

        {/* Desert Hero Section */}
        <section className="relative h-[500px] md:h-[600px] flex items-start justify-start">
          <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url(${desertHero})`
        }} />
          <div className="absolute inset-0 bg-white/20" />
          
          <div className="relative z-10 text-left text-foreground px-4 pt-12 md:pt-16 max-w-4xl ml-2 sm:ml-4 md:ml-8 lg:ml-[1cm]">
            <p className="text-sm md:text-base font-medium tracking-widest uppercase mb-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              A NEW WAY TO EXPLORE ISRAEL
            </p>
            <h2 className="font-sans mb-4 tracking-[-0.02em] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 font-bold text-slate-950 md:text-4xl text-2xl">From desert stillness to coastal rhythm, find the escape that feels like you.</h2>
            <Button size="lg" className="bg-white hover:bg-black text-foreground hover:text-white uppercase tracking-wide font-medium rounded-none animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300" onClick={() => setContactDialogOpen(true)}>
              Register for a chance to win your next trip
            </Button>
          </div>
        </section>

        {/* Hottest of the Season Section */}
        <section className="container py-20">
          <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-[-0.02em] mb-12">
            Hottest of the season
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="rounded-2xl overflow-hidden">
              <img src={desertHotelPool} alt="Desert hotel with pool" className="w-full h-full object-cover" />
            </div>
            
            <div className="space-y-3 lg:pl-8">
              <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
                DESERT MADNESS
              </p>
              <h3 className="font-sans text-4xl font-bold tracking-[-0.02em] md:text-3xl">
                40° of internal peace
              </h3>
              <p className="text-lg text-muted-foreground">
                Check in, drop your bags and let the desert do the rest.
              </p>
              <Button size="lg" className="bg-black hover:bg-black/90 text-white mt-4">
                Let the journey begin
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative py-32 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img src={desertJourney} alt="Desert journey" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
          </div>
          
          <div className="container max-w-6xl relative z-10">
            
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
              {/* Block 1 */}
              <div className="text-center space-y-4 opacity-0 animate-fade-in-up" style={{
              animationDelay: '0.1s'
            }}>
                <h3 className="font-serif text-2xl md:text-3xl font-medium text-white">
                  Follow what moves you
                </h3>
                <p className="text-base leading-relaxed text-white/90 max-w-sm mx-auto">
                  Explore experiences that speak to your mood — slow mornings in the desert, sunrise yoga, a hidden vineyard at dusk, or simply a moment to breathe.
                </p>
              </div>
              
              {/* Block 2 */}
              <div className="text-center space-y-4 opacity-0 animate-fade-in-up" style={{
              animationDelay: '0.3s'
            }}>
                <h3 className="font-serif text-2xl md:text-3xl font-medium text-white">
                  Shape your own moment
                </h3>
                <p className="text-base leading-relaxed text-white/90 max-w-sm mx-auto">
                  Choose your stay, then add the touches that make it uniquely yours — a private ritual, a tasting under the stars, or something beautifully unexpected.
                </p>
              </div>
              
              {/* Block 3 */}
              <div className="text-center space-y-4 opacity-0 animate-fade-in-up" style={{
              animationDelay: '0.5s'
            }}>
                <h3 className="font-serif text-2xl md:text-3xl font-medium text-white">
                  Book, unwind, begin
                </h3>
                <p className="text-base leading-relaxed text-white/90 max-w-sm mx-auto">
                  Secure your date and let the anticipation start. Your STAYMAKOM is waiting — quietly, gently, beautifully.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Experiences Section */}
        <section className="container py-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-[-0.02em]">
              Latest Experiences
            </h2>
            <Button variant="link" className="text-foreground underline underline-offset-4 text-base">
              View all experiences →
            </Button>
          </div>

          {isLoadingExperiences ? <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div> : <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestExperiences?.map(experience => <div key={experience.id} className="group cursor-pointer" onClick={() => window.location.href = `/experience/${experience.slug}`}>
                  <div className="relative h-[400px] rounded-2xl overflow-hidden mb-4">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{
                backgroundImage: `url(${experience.hero_image || desertHotelPool})`
              }} />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <h3 className="text-white font-bold text-3xl uppercase tracking-tight">
                        {experience.title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{experience.hotels?.city}</span>
                    </div>
                    
                    <h4 className="font-bold text-lg">
                      {experience.hotels?.name}
                    </h4>
                    
                    {experience.subtitle && <p className="text-sm text-muted-foreground">
                        {experience.subtitle}
                      </p>}
                    
                     <div className="flex items-baseline gap-2">
                       <span className="font-bold text-xl">
                         {experience.base_price}€
                       </span>
                       <span className="text-muted-foreground">
                         / {experience.base_price_type === 'per_person' ? 'person' : 'stay'}
                       </span>
                     </div>
                  </div>
                </div>)}
            </div>}
        </section>
      </main>

      <Footer />
      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
    </div>;
};
export default Index;