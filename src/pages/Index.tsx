import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Heart, Sparkles, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import heroImage from "@/assets/hero-image.jpg";
import romanticImg from "@/assets/romantic-category.jpg";
import familyImg from "@/assets/family-category.jpg";
import goldenAgeImg from "@/assets/golden-age-category.jpg";
import natureImg from "@/assets/nature-category.jpg";
import tasteImg from "@/assets/taste-category.jpg";
import activeImg from "@/assets/active-category.jpg";

const categories = [
  {
    title: "Romantic",
    description: "Intimate moments and unforgettable experiences for couples",
    image: romanticImg,
    slug: "romantic",
  },
  {
    title: "Family",
    description: "Adventures and memories for the whole family",
    image: familyImg,
    slug: "family",
  },
  {
    title: "Golden Age",
    description: "Curated comfort and sophistication for mature travelers",
    image: goldenAgeImg,
    slug: "golden-age",
  },
  {
    title: "Beyond Nature",
    description: "Immersive outdoor experiences in stunning landscapes",
    image: natureImg,
    slug: "beyond-nature",
  },
  {
    title: "Taste Affair",
    description: "Culinary journeys with master chefs and local flavors",
    image: tasteImg,
    slug: "taste-affair",
  },
  {
    title: "Active Break",
    description: "Energizing activities and wellness adventures",
    image: activeImg,
    slug: "active-break",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] md:h-[700px] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          
          <div className="relative z-10 container text-center text-white px-4">
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Book extraordinary stays
              <br />
              <span className="text-primary-glow">beyond the usual</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              Curated hotel experiences with unique activities, premium amenities, and unforgettable moments
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-glow text-white shadow-strong animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"
            >
              Start Exploring
            </Button>
          </div>
        </section>

        {/* Categories Section */}
        <section className="container py-20">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Choose Your Vibe
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From romantic getaways to family adventures, find the perfect experience for every moment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard key={category.slug} {...category} />
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-muted py-20">
          <div className="container">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-16">
              How It Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Pick your vibe</h3>
                <p className="text-muted-foreground">
                  Browse categories and find experiences that match your style
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Choose your room & extras</h3>
                <p className="text-muted-foreground">
                  Select your accommodation and add premium experiences
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Pay & get confirmation</h3>
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
    </div>
  );
};

export default Index;