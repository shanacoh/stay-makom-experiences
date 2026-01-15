import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import comingSoonHero from "@/assets/coming-soon-hero.jpg";
import comingSoonRoad from "@/assets/coming-soon-road.png";
import MarqueeBanner from "@/components/MarqueeBanner";
import { Check, Gift, Star, Calendar, Sparkles } from "lucide-react";

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lang, setLang] = useState<'en' | 'he'>('en');

  const isRTL = lang === 'he';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(lang === 'en' ? "Please enter a valid email" : "נא להזין כתובת אימייל תקינה");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('collect-lead', {
        body: {
          source: 'coming_soon',
          email: email.toLowerCase().trim(),
          metadata: { lang }
        }
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success(lang === 'en' ? "You're on the list!" : "נרשמת בהצלחה!");
    } catch (error) {
      console.error('Error submitting email:', error);
      toast.error(lang === 'en' ? "Something went wrong. Please try again." : "משהו השתבש. נסו שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = lang === 'en' 
    ? [
        { icon: Star, text: "First look at new experiences" },
        { icon: Gift, text: "Exclusive pre-launch offers" },
        { icon: Calendar, text: "Invitations to private events" },
        { icon: Sparkles, text: "Priority access at launch" }
      ]
    : [
        { icon: Star, text: "הצצה ראשונה לחוויות חדשות" },
        { icon: Gift, text: "הצעות בלעדיות לפני ההשקה" },
        { icon: Calendar, text: "הזמנות לאירועים פרטיים" },
        { icon: Sparkles, text: "גישה עדיפה בהשקה" }
      ];

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex flex-col"
        style={{
          backgroundImage: `url(${comingSoonHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Header */}
        <header className="relative z-10 flex justify-between items-center p-4 sm:p-6 md:p-8">
          <div className="text-white font-bold text-xl sm:text-2xl tracking-wider">
            STAYMAKOM
          </div>
          <button 
            onClick={() => setLang(lang === 'en' ? 'he' : 'en')}
            className="text-white/90 hover:text-white text-sm sm:text-base font-medium transition-colors px-3 py-1.5 rounded-full border border-white/30 hover:border-white/50"
          >
            {lang === 'en' ? 'עב' : 'EN'}
          </button>
        </header>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center">
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide mb-4">
            {lang === 'en' ? 'A NEW WAY OF TRAVELLING' : 'דרך חדשה לטייל'}
          </h1>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wide mb-6">
            {lang === 'en' ? 'IS COMING TO ISRAEL' : 'מגיעה לישראל'}
          </h2>
          <p className="text-white/80 text-lg sm:text-xl md:text-2xl font-light tracking-widest mb-12">
            {lang === 'en' ? 'LAUNCHING 2026' : 'השקה 2026'}
          </p>

          {/* Join the Club Card */}
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-primary" />
              <h3 className="text-foreground text-lg sm:text-xl font-semibold tracking-wide">
                {lang === 'en' ? 'JOIN THE CLUB' : 'הצטרפו למועדון'}
              </h3>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base mb-6">
              {lang === 'en' ? 'Be the first to know' : 'היו הראשונים לדעת'}
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={lang === 'en' ? 'Your email' : 'האימייל שלך'}
                    className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base whitespace-nowrap"
                  >
                    {isSubmitting 
                      ? (lang === 'en' ? 'Joining...' : 'מצטרף...') 
                      : (lang === 'en' ? 'Notify Me' : 'עדכנו אותי')
                    }
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 text-green-600">
                <Check className="w-5 h-5" />
                <span className="font-medium">
                  {lang === 'en' ? "You're on the list!" : 'נרשמת בהצלחה!'}
                </span>
              </div>
            )}

            {/* Benefits */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground text-sm">
                  <benefit.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground text-xs mt-6">
              {lang === 'en' ? "We'll never spam. Promise." : 'לא נשלח ספאם. מבטיחים.'}
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 pb-8 flex justify-center">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Marquee Banner */}
      <MarqueeBanner />

      {/* Description Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Image */}
            <div className={`${isRTL ? 'lg:order-2' : 'lg:order-1'}`}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={comingSoonRoad} 
                  alt="Desert road" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text */}
            <div className={`${isRTL ? 'lg:order-1' : 'lg:order-2'} space-y-6`}>
              <div className="space-y-4">
                <p className="text-muted-foreground text-lg sm:text-xl">
                  {lang === 'en' ? 'Not another booking site.' : 'לא עוד אתר הזמנות.'}
                </p>
                <p className="text-muted-foreground text-lg sm:text-xl">
                  {lang === 'en' ? 'Not a comparison tool.' : 'לא כלי השוואה.'}
                </p>
              </div>
              
              <h3 className="text-foreground text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
                {lang === 'en' 
                  ? 'STAYMAKOM is about experiences first.' 
                  : 'STAYMAKOM זה קודם כל חוויות.'
                }
              </h3>

              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                {lang === 'en' 
                  ? "A platform that brings together Israel's most inspiring hotels with curated immersive experiences."
                  : 'פלטפורמה שמחברת בין המלונות המעוררי ההשראה בישראל לבין חוויות סוחפות ואוצרות בקפידה.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 bg-foreground text-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-lg sm:text-xl font-light tracking-wide mb-4">
            {lang === 'en' 
              ? 'Handpicked hotels. Unforgettable experiences.' 
              : 'מלונות נבחרים. חוויות בלתי נשכחות.'
            }
          </p>
          <p className="text-sm text-background/60">
            © 2026 StayMakom. {lang === 'en' ? 'All rights reserved.' : 'כל הזכויות שמורות.'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ComingSoon;
