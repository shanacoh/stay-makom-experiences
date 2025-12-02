import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Sparkles } from "lucide-react";
import aboutHero from "@/assets/about-hero-road.jpg";
const About = () => {
  return <div className="min-h-screen bg-[#FAF8F5]">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[350px] sm:min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="About STAYMAKOM" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 text-center text-white px-6 animate-fade-in max-w-3xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 font-sans font-bold text-slate-50">STAYMAKOM</h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-50 font-sans font-medium">HANDPICKED HOTELS. UNFORGETTABLE EXPERIENCES.</p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6">
        {/* Our Philosophy */}
        <section className="py-16 animate-fade-in" style={{
        animationDelay: "0.2s"
      }}>
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-8">
            Our Philosophy
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-muted-foreground text-center max-w-3xl mx-auto font-light">STAYMAKOM was born from a simple belief: travel is not about ticking places off a list, but about feeling something.

We curate stays and experiences across Israel that speak to the senses: slow mornings, desert silence, shared meals, unexpected encounters.<br /><br />
            We curate stays and experiences across Israel that speak to the senses: slow mornings, desert silence, shared meals, unexpected encounters.
          </p>
        </section>

        {/* What We Do */}
        <section className="py-16 animate-fade-in" style={{
        animationDelay: "0.4s"
      }}>
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-10">
            What We Do
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#D72638]/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#D72638]" />
                  </div>
                </div>
                <h3 className="font-serif text-lg mb-3">Curated Hotels</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Handpicked places with soul, stories, and character.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#D72638]/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#D72638]" />
                  </div>
                </div>
                <h3 className="font-serif text-lg mb-3">Experiences with Meaning</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rituals, flavors, landscapes, and moments crafted with intention.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-8 pb-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#D72638]/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-[#D72638]" />
                  </div>
                </div>
                <h3 className="font-serif text-lg mb-3">A Different Way to Travel</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Slow, emotional, intimate, beyond the usual.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why We Exist */}
        <section className="py-16 animate-fade-in" style={{
        animationDelay: "0.6s"
      }}>
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-8">
            Why We Exist
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-muted-foreground text-center max-w-3xl mx-auto font-light">
            We wanted to reconnect travelers with what truly matters: emotion, beauty, and the quiet joy of being present somewhere.
            <br /><br />
            STAYMAKOM is our way of honoring that.
          </p>
        </section>

        {/* Who We Are */}
        <section className="py-16 animate-fade-in" style={{
        animationDelay: "0.8s"
      }}>
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-8">
            Who We Are
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2" alt="Team member" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" alt="Team member" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground text-center">
              We're a small team of travelers, storytellers, and curators who fell in love with Israel's hidden corners. 
              We believe in slowing down, looking closer, and creating connections that last beyond the journey.
            </p>
          </div>
        </section>

        {/* Final Touch */}
        <section className="py-16 text-center animate-fade-in" style={{
        animationDelay: "1s"
      }}>
          <div className="max-w-xl mx-auto">
            <p className="font-serif text-xl md:text-2xl text-muted-foreground italic">
              "The art of travel is the art of seeing with new eyes."
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default About;