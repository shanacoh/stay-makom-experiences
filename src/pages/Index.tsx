import { Button } from "@/components/ui/button";
import { Check, Heart, Sparkles, Calendar, Loader2 } from "lucide-react";
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
      } = await supabase.from("categories").select("*").eq("status", "published").order("created_at", {
        ascending: true
      });
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
            <h1 className="font-sans text-4xl lg:text-7xl font-bold mb-6 tracking-[-0.02em] animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase max-w-3xl text-slate-50 md:text-5xl">
              More than a stay,
              <br />
              it's a{" "}
              <RotatingText words={categories?.map(cat => cat.name) || ["Romance", "Adventure", "Family"]} interval={2500} />
            </h1>
            
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white uppercase tracking-wide font-medium shadow-strong animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              Start Exploring
            </Button>
          </div>
        </section>

        {/* Categories Section */}
        <section className="container py-20">
          <div className="text-center mb-12">
            <h2 className="font-sans text-4xl font-bold tracking-[-0.02em] mb-4 md:text-6xl">DON'T CHOOSE A CITY 
CHOOSE YOUR ESCAPE</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">From desert stillness to coastal rhytm, find the escape that feels like you.</p>
          </div>

          {isLoading ? <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <h2 className="font-sans md:text-7xl mb-4 tracking-[-0.02em] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 text-2xl font-bold">From the desert to the sea, from vineyards to kibbutzim, (RE)discover Israel through experiences that fl like nowhere else.</h2>
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
        <section className="py-16" style={{
        backgroundColor: '#FAF8F5'
      }}>
          <div className="container">
            <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-[-0.02em] text-center mb-12">
              How It Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-sans text-xl font-bold mb-2 text-primary">Craft your stay</h3>
                <p className="text-muted-foreground">Explore experiences that speak to your mood, from sunrise yoga to desert stargazing.</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-sans text-xl font-bold mb-2 text-primary">Make it yours</h3>
                <p className="text-muted-foreground">Choose your stay and add the touches that make it unforgettable.</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-sans text-xl font-bold mb-2 text-primary">Book & get ready</h3>
                <p className="text-muted-foreground">Secure your spot and start dreaming, your STAYMAKOM is waiting.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-20">
          <div className="gradient-hero rounded-2xl p-12 text-center text-white">
            <Calendar className="h-12 w-12 mx-auto mb-6" />
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of travelers discovering extraordinary stays around the world
            </p>
            <Button size="lg" variant="secondary" className="shadow-strong">
              Browse All Experiences
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
    </div>;
};
export default Index;