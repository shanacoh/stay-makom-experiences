import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, Users, Globe, Hotel, Sparkles, Search, Calendar, CheckCircle, Compass } from "lucide-react";
import aboutHero from "@/assets/about-hero-desert.png";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";

const About = () => {
  const { lang } = useLanguage();
  const isRTL = lang === 'he';
  const { getLocalizedPath } = useLocalizedNavigation();

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <SEOHead 
        titleEn="About STAYMAKOM | Curated Hotel Stays in Israel" 
        titleHe="אודות STAYMAKOM | חוויות אירוח מובחרות בישראל" 
        descriptionEn="Discover STAYMAKOM - a curated booking platform combining boutique hotels and immersive local experiences in Israel." 
        descriptionHe="גלו את STAYMAKOM - פלטפורמת הזמנות מובחרת המשלבת מלונות בוטיק וחוויות מקומיות סוחפות בישראל." 
      />
      <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[350px] sm:min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="Desert road journey" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-6 animate-fade-in max-w-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
          <p className="text-sm sm:text-base md:text-lg text-slate-100 font-sans font-medium tracking-widest uppercase mb-3">
            {t(lang, 'aboutHeroTagline')}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white">
            STAYMAKOM
          </h1>
        </div>
      </section>

      <main dir={isRTL ? 'rtl' : 'ltr'}>
        {/* What is STAYMAKOM */}
        <section className="py-16 md:py-20 px-6 bg-white">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-8 text-foreground">
              {t(lang, 'aboutWhatIsTitle')}
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-6">
              {t(lang, 'aboutWhatIsP1')}
            </p>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-8">
              {t(lang, 'aboutWhatIsP2')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm md:text-base text-muted-foreground italic">
              <span>{t(lang, 'aboutWhatIsQuote1')}</span>
              <span>{t(lang, 'aboutWhatIsQuote2')}</span>
              <span>{t(lang, 'aboutWhatIsQuote3')}</span>
            </div>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mt-8 mb-10">
              {t(lang, 'aboutWhatIsP3')}
            </p>
            <Button asChild size="lg" className="bg-[#D72638] hover:bg-[#D72638]/90 text-white">
              <Link to={getLocalizedPath("/experiences")}>{t(lang, 'aboutExploreStays')}</Link>
            </Button>
          </div>
        </section>

        {/* Who STAYMAKOM is for */}
        <section className="py-16 md:py-20 px-6 bg-[#FAF8F5]">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-center mb-12 text-foreground">
              {t(lang, 'aboutWhoForTitle')}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-[#D72638]/10 flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-[#D72638]" />
                </div>
                <h3 className="font-serif text-lg md:text-xl mb-4 text-foreground">
                  {t(lang, 'aboutWhoFor1Title')}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {t(lang, 'aboutWhoFor1Desc')}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-[#D72638]/10 flex items-center justify-center mb-6">
                  <MapPin className="w-7 h-7 text-[#D72638]" />
                </div>
                <h3 className="font-serif text-lg md:text-xl mb-4 text-foreground">
                  {t(lang, 'aboutWhoFor2Title')}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {t(lang, 'aboutWhoFor2Desc')}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-[#D72638]/10 flex items-center justify-center mb-6">
                  <Hotel className="w-7 h-7 text-[#D72638]" />
                </div>
                <h3 className="font-serif text-lg md:text-xl mb-4 text-foreground">
                  {t(lang, 'aboutWhoFor3Title')}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {t(lang, 'aboutWhoFor3Desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* For Israelis and International Travelers */}
        <section className="py-16 md:py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-center mb-12 text-foreground">
              {t(lang, 'aboutDesignedForTitle')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="bg-gradient-to-br from-[#FAF8F5] to-white rounded-2xl p-8 md:p-10 border border-border/30">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-6 h-6 text-[#D72638]" />
                  <h3 className="font-serif text-xl md:text-2xl text-foreground">{t(lang, 'aboutForInternational')}</h3>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  {t(lang, 'aboutForInternationalP1')}
                </p>
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  {t(lang, 'aboutForInternationalP2')}
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {t(lang, 'aboutForInternationalP3')}
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#FAF8F5] to-white rounded-2xl p-8 md:p-10 border border-border/30">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-6 h-6 text-[#D72638]" />
                  <h3 className="font-serif text-xl md:text-2xl text-foreground">{t(lang, 'aboutForIsraelis')}</h3>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  {t(lang, 'aboutForIsraelisP1')}
                </p>
                <p className="text-base text-muted-foreground leading-relaxed mb-4">
                  {t(lang, 'aboutForIsraelisP2')}
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {t(lang, 'aboutForIsraelisP3')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What makes STAYMAKOM different */}
        <section className="py-16 md:py-20 px-6 bg-[#1a1a1a] text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-10 text-zinc-50">
              {t(lang, 'aboutDifferentTitle')}
            </h2>
            <div className="space-y-4 mb-10">
              {[
                t(lang, 'aboutDifferent1'),
                t(lang, 'aboutDifferent2'),
                t(lang, 'aboutDifferent3'),
                t(lang, 'aboutDifferent4'),
                t(lang, 'aboutDifferent5')
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-center gap-3 text-base md:text-lg">
                  <CheckCircle className="w-5 h-5 text-[#D72638] flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-base md:text-lg text-white/70 italic max-w-xl mx-auto">
              {t(lang, 'aboutDifferentQuote')}
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 md:py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-center mb-12 text-foreground">
              {t(lang, 'aboutHowItWorksTitle')}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Search, title: t(lang, 'aboutStep1'), description: t(lang, 'aboutStep1Desc') },
                { icon: Sparkles, title: t(lang, 'aboutStep2'), description: t(lang, 'aboutStep2Desc') },
                { icon: Calendar, title: t(lang, 'aboutStep3'), description: t(lang, 'aboutStep3Desc') },
                { icon: Compass, title: t(lang, 'aboutStep4'), description: t(lang, 'aboutStep4Desc') }
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#D72638]/10 flex items-center justify-center mx-auto mb-5">
                    <step.icon className="w-8 h-8 text-[#D72638]" />
                  </div>
                  <div className="text-3xl font-serif text-[#D72638]/30 mb-2">{String(index + 1).padStart(2, '0')}</div>
                  <h3 className="font-serif text-lg md:text-xl mb-3 text-foreground">{step.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why STAYMAKOM exists */}
        <section className="py-16 md:py-20 px-6 bg-[#FAF8F5]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-8 text-foreground">
              {t(lang, 'aboutWhyExistsTitle')}
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-6">
              {t(lang, 'aboutWhyExistsP1')}
            </p>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-8">
              {t(lang, 'aboutWhyExistsP2')}
            </p>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <p className="font-serif text-lg md:text-xl text-foreground leading-relaxed">
                {t(lang, 'aboutWhyExistsQuote1')}<br />
                {t(lang, 'aboutWhyExistsQuote2')}<br />
                <span className="text-[#D72638]">{t(lang, 'aboutWhyExistsQuote3')}</span>
              </p>
            </div>
          </div>
        </section>

        {/* The Name */}
        <section className="py-16 md:py-20 px-6 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl mb-8 text-foreground">
              {t(lang, 'aboutNameTitle')}
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-6">
              {t(lang, 'aboutNameP1')}
            </p>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
              {t(lang, 'aboutNameP2')}
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-28 px-6 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-10 text-neutral-50">
              {t(lang, 'aboutCTATitle')}
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-[#D72638] hover:bg-[#D72638]/90 text-white px-8">
                <Link to={getLocalizedPath("/experiences")}>{t(lang, 'aboutCTAExplore')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                <Link to={getLocalizedPath("/contact")}>{t(lang, 'aboutCTAList')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
