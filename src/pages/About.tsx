import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Users, Globe, Hotel, Sparkles, Search, Calendar, CheckCircle, Compass } from "lucide-react";
import aboutHero from "@/assets/about-hero-desert.png";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
const About = () => {
  return <div className="min-h-screen bg-[#FAF8F5]">
      <SEOHead titleEn="About STAYMAKOM | Curated Hotel Stays in Israel" titleHe="אודות STAYMAKOM | חוויות אירוח מובחרות בישראל" descriptionEn="Discover STAYMAKOM - a curated booking platform combining boutique hotels and immersive local experiences in Israel." descriptionHe="גלו את STAYMAKOM - פלטפורמת הזמנות מובחרת המשלבת מלונות בוטיק וחוויות מקומיות סוחפות בישראל." />
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[350px] sm:min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="Desert road journey" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-6 animate-fade-in max-w-3xl">
          <p className="text-sm sm:text-base md:text-lg text-slate-100 font-sans font-medium tracking-widest uppercase mb-3">
            Where Every Stay Tells a Story
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">
            STAYMAKOM
          </h1>
        </div>
      </section>

      <main>
        {/* What is STAYMAKOM */}
        <section className="py-16 md:py-20 px-6 bg-white">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-8 text-foreground">
              What is STAYMAKOM
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-6">
              STAYMAKOM is a curated booking platform for complete hotel stays in Israel, 
              combining boutique hotels and immersive local experiences in one booking.
            </p>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-8">
              Instead of booking a room and planning everything else separately, 
              STAYMAKOM lets travelers book a stay that already makes sense.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm md:text-base text-muted-foreground italic">
              <span>A specific place.</span>
              <span>A clear rhythm.</span>
              <span>A set of experiences designed to belong together.</span>
            </div>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mt-8 mb-10">
              Each stay pairs a handpicked hotel with carefully selected experiences 
              based on location, season, and type of traveler.
            </p>
            <Button asChild size="lg" className="bg-[#D72638] hover:bg-[#D72638]/90 text-white">
              <Link to="/experiences">Explore Stays</Link>
            </Button>
          </div>
        </section>

        {/* Who STAYMAKOM is for */}
        <section className="py-16 md:py-20 px-6 bg-[#FAF8F5]">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-center mb-12 text-foreground">
              Who STAYMAKOM is for
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-[#D72638]/10 flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-[#D72638]" />
                </div>
                <h3 className="font-serif text-lg md:text-xl mb-4 text-foreground">
                  Travelers looking for more than a hotel
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  For people who want their stay to feel intentional. Couples, families, solo travelers, 
                  and professionals who care about atmosphere, meaning, and quality rather than standard hotel packages.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-[#D72638]/10 flex items-center justify-center mb-6">
                  <MapPin className="w-7 h-7 text-[#D72638]" />
                </div>
                <h3 className="font-serif text-lg md:text-xl mb-4 text-foreground">
                  Israelis rediscovering their own country
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  For locals looking for an easy way to book inspiring staycations, midweek escapes, 
                  or short breaks that feel genuinely different from typical hotel offers.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-[#D72638]/10 flex items-center justify-center mb-6">
                  <Hotel className="w-7 h-7 text-[#D72638]" />
                </div>
                <h3 className="font-serif text-lg md:text-xl mb-4 text-foreground">
                  Hotels with a point of view
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  For boutique hotels and unique properties that want to be discovered for what makes them special, 
                  not reduced to price comparisons or anonymous listings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* For Israelis and International Travelers */}
        <section className="py-16 md:py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-center mb-12 text-foreground">
              Designed for both Israelis and international travelers
            </h2>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="bg-gradient-to-br from-[#FAF8F5] to-white rounded-2xl p-8 md:p-10 border border-border/30">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-6 h-6 text-[#D72638]" />
                  <h3 className="font-serif text-xl md:text-2xl text-foreground">For international travelers</h3>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  STAYMAKOM helps you discover Israel beyond the obvious routes.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  Boutique hotels, meaningful experiences, and places you would not easily find on global booking platforms.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Everything is curated, contextualized, and ready to book in one coherent stay.
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#FAF8F5] to-white rounded-2xl p-8 md:p-10 border border-border/30">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-6 h-6 text-[#D72638]" />
                  <h3 className="font-serif text-xl md:text-2xl text-foreground">For Israelis</h3>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  STAYMAKOM makes it easy to experience your own country differently.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  Midweek escapes, staycations, and short breaks designed with the same care usually reserved for international travel.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  No standard packages. No generic deals. Just well designed stays, close to home.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What makes STAYMAKOM different */}
        <section className="py-16 md:py-20 px-6 bg-[#1a1a1a] text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-10 text-zinc-50">
              What makes STAYMAKOM different
            </h2>
            <div className="space-y-4 mb-10">
              {["Hotels are curated, not listed", "Experiences are included, not optional add-ons", "Each stay is designed around a place, not a room", "No endless scrolling, only relevant choices", "One platform, one booking, one coherent stay"].map((item, index) => <div key={index} className="flex items-center justify-center gap-3 text-base md:text-lg">
                  <CheckCircle className="w-5 h-5 text-[#D72638] flex-shrink-0" />
                  <span>{item}</span>
                </div>)}
            </div>
            <p className="text-base md:text-lg text-white/70 italic max-w-xl mx-auto">
              STAYMAKOM does not try to offer everything. It exists to offer the right stays, 
              to the right people, at the right moment.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-center mb-12 text-foreground">
              How it works
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[{
              icon: Search,
              title: "Discover",
              description: "Browse a limited selection of curated stays by mood, interest, or destination."
            }, {
              icon: Sparkles,
              title: "Choose",
              description: "Each stay includes a hotel and a set of experiences designed to naturally fit together."
            }, {
              icon: Calendar,
              title: "Book",
              description: "One booking. No coordination. Everything is prepared before you arrive."
            }, {
              icon: Compass,
              title: "Experience",
              description: "Arrive, disconnect, and live the stay as it was designed to be lived."
            }].map((step, index) => <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#D72638]/10 flex items-center justify-center mx-auto mb-5">
                    <step.icon className="w-8 h-8 text-[#D72638]" />
                  </div>
                  <div className="text-3xl font-serif text-[#D72638]/30 mb-2">{String(index + 1).padStart(2, '0')}</div>
                  <h3 className="font-serif text-lg md:text-xl mb-3 text-foreground">{step.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{step.description}</p>
                </div>)}
            </div>
          </div>
        </section>

        {/* Why STAYMAKOM exists */}
        <section className="py-16 md:py-20 px-6 bg-[#FAF8F5]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-8 text-foreground">
              Why STAYMAKOM exists
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-6">
              Travel has become fragmented. Too many platforms. Too many tabs. 
              Too many decisions for something meant to feel simple.
            </p>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-8">
              STAYMAKOM was created to simplify travel while making it more meaningful. 
              To help travelers experience Israel in a more intimate, human, and intentional way.
            </p>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <p className="font-serif text-lg md:text-xl text-foreground leading-relaxed">
                We believe that where you stay matters.<br />
                What you do matters.<br />
                <span className="text-[#D72638]">And how it all fits together matters most.</span>
              </p>
            </div>
          </div>
        </section>

        {/* The Name */}
        <section className="py-16 md:py-20 px-6 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-8 text-foreground">
              Why the name STAYMAKOM
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-6">
              <span className="font-semibold text-foreground">Makom</span> means <em>place</em> in Hebrew. 
              Not just a location, but a place with presence and meaning.
            </p>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
              STAYMAKOM is about staying somewhere that feels right. 
              Somewhere that leaves a trace. 
              Somewhere you remember long after you leave.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-28 px-6 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-10 text-neutral-50">
              Ready to discover STAYMAKOM?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-[#D72638] hover:bg-[#D72638]/90 text-white px-8">
                <Link to="/experiences">Explore Curated Stays</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                <Link to="/contact">Get on the List</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default About;