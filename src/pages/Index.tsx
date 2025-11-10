import { Button } from "@/components/ui/button";
import { Check, Heart, Sparkles, Calendar, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import RotatingText from "@/components/RotatingText";
import heroImage from "@/assets/hero-image-new.jpg";
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
                <h3 className="font-sans text-xl font-bold mb-2 text-primary">Pick your vibe</h3>
                <p className="text-muted-foreground">
                  Browse categories and find experiences that match your style
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-sans text-xl font-bold mb-2 text-primary">Choose your room & extras</h3>
                <p className="text-muted-foreground">
                  Select your accommodation and add premium experiences
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-sans text-xl font-bold mb-2 text-primary">Pay & get confirmation</h3>
                <p className="text-muted-foreground">
                  Secure payment and instant confirmation for your extraordinary stay
                </p>
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
    </div>;
};
export default Index;