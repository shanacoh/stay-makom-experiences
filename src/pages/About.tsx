import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Sparkles } from "lucide-react";
import aboutHero from "@/assets/about-hero-desert.png";

const About = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[350px] sm:min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="Desert road journey" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative z-10 text-center text-white px-6 animate-fade-in max-w-3xl">
          <p className="text-sm sm:text-base md:text-lg text-slate-100 font-sans font-medium tracking-widest uppercase mb-3">Where Every Stay Tells a Story</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">STAYMAKOM</h1>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6">
        {/* Our Philosophy */}
        <section className="py-16 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-8">
            Our Philosophy
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-muted-foreground text-center max-w-3xl mx-auto font-light">
            STAYMAKOM was born from a simple belief: travel is not about ticking places off a list — it's about feeling something.
            <br /><br />
            We curate stays and experiences across Israel that speak to the senses: slow mornings, desert silence, shared meals, unexpected encounters. Every journey we craft is an invitation to connect — with a place, with yourself, with the moment.
          </p>
        </section>

        {/* What We Do */}
        <section className="py-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
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
                  Handpicked places with soul, stories, and character — each one chosen for its unique spirit.
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
                <h3 className="font-serif text-lg mb-3">Meaningful Experiences</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rituals, flavors, landscapes, and moments crafted with intention — designed to leave a mark.
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
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Slow, emotional, intimate — beyond the usual, into the unforgettable.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why We Exist */}
        <section className="py-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <h2 className="font-serif text-2xl md:text-3xl text-center mb-8">
            Why We Exist
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-muted-foreground text-center max-w-3xl mx-auto font-light">
            We wanted to reconnect travelers with what truly matters: emotion, beauty, and the quiet joy of being present somewhere.
            <br /><br />
            In a world of endless options, we believe in fewer, better choices. STAYMAKOM is our way of honoring that — a curated path to experiences that stay with you long after you return home.
          </p>
        </section>

        {/* Final Touch */}
        <section className="py-16 text-center animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <div className="max-w-xl mx-auto">
            <p className="font-serif text-xl md:text-2xl text-muted-foreground italic">
              "The art of travel is the art of seeing with new eyes."
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
