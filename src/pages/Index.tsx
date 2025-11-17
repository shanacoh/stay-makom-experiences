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
        <section className="relative h-[800px] md:h-[950px] flex items-end">
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

        {/* A New Way to Explore Israel Section */}
        <section className="container py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-sans text-4xl font-bold tracking-[-0.02em] mb-6 md:text-6xl text-center">A NEW WAY TO EXPLORE ISRAEL</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Israel is small, diverse and easy to explore. In 2 to 3 hours you can move from Tel Aviv's beaches to the Negev desert, from Galilee vineyards to Jerusalem's hills. With STAYMAKOM, you do not choose a city. You choose a hotel + experience escape that matches your mood. If you do not want to drive, many escapes let you add a private driver or transfer as an optional extra.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="space-y-3">
                <h3 className="font-bold text-lg">All across the country</h3>
                <p className="text-sm text-muted-foreground">Sea, desert, cities, kibbutzim, vineyards and forest retreats.</p>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-lg">Hotel + Experience only</h3>
                <p className="text-sm text-muted-foreground">Every escape is a curated package, not just a room.</p>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-lg">For locals and travelers</h3>
                <p className="text-sm text-muted-foreground">Perfect for yom kef, weekends, staycations or longer holidays.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Discover Israel's Hidden Gems Section */}
        <section className="container py-20 bg-gradient-subtle">
          <div className="text-center mb-12">
            <h2 className="font-sans text-4xl font-bold tracking-[-0.02em] mb-4 md:text-6xl">DISCOVER ISRAEL'S HIDDEN GEMS</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Go beyond the classic Tel Aviv and Jerusalem route. Discover intimate and unique places across the country.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="font-bold text-xl">Desert and Arava</h3>
              <p className="text-sm text-muted-foreground">Silent nights, starry skies, sunrise hikes and slow living.</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-xl">Galilee and Golan</h3>
              <p className="text-sm text-muted-foreground">Vineyards, rivers, forests and farm-to-table moments.</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-xl">Jerusalem and the Hills</h3>
              <p className="text-sm text-muted-foreground">History, views, spa retreats and boutique stays.</p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-xl">Tel Aviv and the Coast</h3>
              <p className="text-sm text-muted-foreground">Beachfront hotels, rooftops, urban energy and sea breeze.</p>
            </div>
          </div>
        </section>

        {/* Desert Hero Section */}
        <section className="relative h-[500px] md:h-[600px] flex items-start justify-start">
          <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: `url(${desertHero})`
        }} />
          <div className="absolute inset-0 bg-white/20" />
          
          <div className="relative z-10 text-left text-foreground px-4 pt-12 md:pt-16 max-w-4xl ml-2 sm:ml-4 md:ml-8 lg:ml-[1cm]">
            <p className="text-sm md:text-base font-medium tracking-widest uppercase mb-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              WIN YOUR NEXT TRIP
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
              <Button 
                size="lg" 
                className="bg-black hover:bg-black/90 text-white mt-4"
                onClick={() => {
                  if (latestExperiences && latestExperiences.length > 0) {
                    navigate(`/experience/${latestExperiences[0].slug}`);
                  } else {
                    navigate('/category/beyond-nature');
                  }
                }}
              >
                Let the journey begin
              </Button>
            </div>
          </div>
        </section>

        {/* How STAYMAKOM Works Section */}
        <section className="relative py-32 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img src={desertJourney} alt="Desert journey" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
          </div>
          
          <div className="container max-w-6xl relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Step 1 */}
              <div className="text-center space-y-4 opacity-0 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-medium text-white">
                  Choose your mood
                </h3>
                <p className="text-sm leading-relaxed text-white/90 max-w-sm mx-auto">
                  Romantic, active, family, nature, food and more.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="text-center space-y-4 opacity-0 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-medium text-white">
                  Pick your hotel + experience
                </h3>
                <p className="text-sm leading-relaxed text-white/90 max-w-sm mx-auto">
                  Each package bundles a stay with a signature experience such as spa, dinner, wine, cooking class, yoga or desert tour.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="text-center space-y-4 opacity-0 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-medium text-white">
                  Add your extras
                </h3>
                <p className="text-sm leading-relaxed text-white/90 max-w-sm mx-auto">
                  Depending on the escape, you can add upgrades like spa rituals, dinner, wine tasting or a private driver.
                </p>
              </div>
              
              {/* Step 4 */}
              <div className="text-center space-y-4 opacity-0 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-medium text-white">
                  Book and enjoy
                </h3>
                <p className="text-sm leading-relaxed text-white/90 max-w-sm mx-auto">
                  Secure your dates in a few clicks. Everything is ready when you arrive.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Travelers Choose STAYMAKOM Section */}
        <section className="container py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-sans text-4xl font-bold tracking-[-0.02em] mb-12 md:text-6xl text-center">WHY TRAVELERS CHOOSE STAYMAKOM</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="font-bold text-xl">Curated selection</h3>
                <p className="text-sm text-muted-foreground">We handpick hotels and experiences for their vibe, not just their stars.</p>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-xl">Hotel + Experience packages</h3>
                <p className="text-sm text-muted-foreground">Each escape is already designed and easy to book.</p>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-xl">Israel-wide</h3>
                <p className="text-sm text-muted-foreground">From Eilat to the Galilee, Tel Aviv, Jerusalem, the Negev and the Dead Sea.</p>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-xl">For locals and visitors</h3>
                <p className="text-sm text-muted-foreground">Discover a new side of Israel, whether you live here or visit.</p>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-xl">Clear and human</h3>
                <p className="text-sm text-muted-foreground">Real descriptions and a small, curated selection.</p>
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