import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";

const LaunchFooter = () => {
  const [email, setEmail] = useState("");
  const { lang } = useLanguage();
  const { getLocalizedPath } = useLocalizedNavigation();
  const isRTL = lang === "he";

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("leads").insert({
        source: "newsletter",
        email: email.trim(),
      });
      if (error) throw error;
      toast.success(isRTL ? "נרשמת בהצלחה! ברוכים הבאים למסע." : "You're in! Welcome to the journey.");
      setEmail("");
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error(isRTL ? "משהו השתבש. נסה שנית." : "Something went wrong. Please try again.");
    }
  };

  const SocialIcons = ({ iconSize = "h-5 w-5", className = "" }: { iconSize?: string; className?: string }) => (
    <div className={`flex items-center gap-4 ${className}`}>
      <a href="https://www.instagram.com/staymakom/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-smooth">
        <Instagram className={iconSize} />
      </a>
      <a href="https://tiktok.com/@staymakom" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-smooth">
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      </a>
    </div>
  );

  const EmailForm = ({ className = "" }: { className?: string }) => (
    <form onSubmit={handleNewsletterSubmit} className={className}>
      <Input
        type="email"
        placeholder={isRTL ? "האימייל שלך" : "Your email"}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white/10 border-white/20 text-white text-sm placeholder:text-white/50 focus-visible:border-primary"
        required
      />
      <Button type="submit" variant="secondary" size="sm" className="mt-2 w-full bg-accent hover:bg-accent/90 text-white border-none">
        {isRTL ? "הרשמה" : "Subscribe"}
      </Button>
    </form>
  );

  const brandTagline = isRTL ? "מלונות שנבחרו בקפידה. חוויות בלתי נשכחות." : "Handpicked Hotels. Unforgettable Experiences.";
  const brandTaglineBr = isRTL ? (<>מלונות שנבחרו בקפידה.<br />חוויות בלתי נשכחות.</>) : (<>Handpicked Hotels.<br />Unforgettable Experiences.</>);
  const giftCardLabel = isRTL ? "כרטיס מתנה" : "Gift Card";
  const partnerLabel = isRTL ? "הפוך לשותף" : "Become a Partner";
  const exploreLabel = isRTL ? "גלה" : "Explore";
  const adventureLabel = isRTL ? "הרפתקה" : "Feel Adventurous";
  const romanticLabel = isRTL ? "בריחה רומנטית" : "Romantic Escape";
  const joinLabel = isRTL ? "הצטרף למסע" : "Join the journey";
  const followLabel = isRTL ? "עקבו אחרינו" : "Follow us";
  const followDesc = isRTL ? "צפו בנו בונים. גלו את ישראל אחרת." : "Watch us build. Discover Israel differently.";
  const privacyLabel = isRTL ? "מדיניות פרטיות" : "Privacy Policy";
  const termsLabel = isRTL ? "תנאי שימוש" : "Terms";

  return (
    <footer className="bg-[#1a1a1a] text-white border-t border-white/10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container py-8">

        {/* ─── DESKTOP (lg+) — 4 compact columns ─── */}
        <div className="hidden lg:block">
          <div className="max-w-4xl mx-auto grid grid-cols-4 gap-6">
            <div>
              <h3 className="font-sans text-xl font-bold uppercase tracking-[-0.04em] mb-2 text-slate-50">STAYMAKOM</h3>
              <p className="text-xs text-white/80 leading-relaxed">{brandTaglineBr}</p>
            </div>
            <div>
              <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4 text-slate-50">STAYMAKOM</h4>
              <ul className="space-y-2">
                <li><Link to={getLocalizedPath("/gift-card")} className="text-sm text-white hover:text-primary transition-smooth">{giftCardLabel}</Link></li>
                <li><Link to={getLocalizedPath("/partners")} className="text-sm text-white hover:text-primary transition-smooth">{partnerLabel}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4 text-slate-50">{exploreLabel}</h4>
              <ul className="space-y-2">
                <li><Link to={getLocalizedPath("/category/adventure")} className="text-sm text-white hover:text-primary transition-smooth">{adventureLabel}</Link></li>
                <li><Link to={getLocalizedPath("/category/romantic")} className="text-sm text-white hover:text-primary transition-smooth">{romanticLabel}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4 text-slate-50">{joinLabel}</h4>
              <EmailForm className="mb-4" />
              <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-2 text-slate-50">{followLabel}</p>
              <SocialIcons />
              <p className="text-xs text-white/60 mt-2 leading-relaxed">{followDesc}</p>
            </div>
          </div>
        </div>

        {/* ─── TABLET (md to lg) — 2 columns ─── */}
        <div className="hidden md:block lg:hidden">
          <div className="max-w-2xl mx-auto grid grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <h3 className="font-sans text-xl font-bold uppercase tracking-[-0.04em] mb-2 text-slate-50">STAYMAKOM</h3>
                <p className="text-xs text-white/80 leading-relaxed">{brandTaglineBr}</p>
              </div>
              <div>
                <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-3 text-slate-50">STAYMAKOM</h4>
                <ul className="space-y-2">
                  <li><Link to={getLocalizedPath("/gift-card")} className="text-sm text-white hover:text-primary transition-smooth">{giftCardLabel}</Link></li>
                  <li><Link to={getLocalizedPath("/partners")} className="text-sm text-white hover:text-primary transition-smooth">{partnerLabel}</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-3 text-slate-50">{exploreLabel}</h4>
                <ul className="space-y-2">
                  <li><Link to={getLocalizedPath("/category/adventure")} className="text-sm text-white hover:text-primary transition-smooth">{adventureLabel}</Link></li>
                  <li><Link to={getLocalizedPath("/category/romantic")} className="text-sm text-white hover:text-primary transition-smooth">{romanticLabel}</Link></li>
                </ul>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4 text-slate-50">{joinLabel}</h4>
                <EmailForm className="mb-0" />
              </div>
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-2 text-slate-50">{followLabel}</p>
                <SocialIcons />
                <p className="text-xs text-white/60 mt-2 leading-relaxed">{followDesc}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MOBILE (<md) — compact, centered ─── */}
        <div className="md:hidden text-center space-y-5">
          <div className="pb-4 border-b border-white/15">
            <h3 className="font-sans text-2xl font-bold uppercase tracking-[-0.04em] mb-1 text-slate-50">STAYMAKOM</h3>
            <p className="text-xs text-white/80 leading-relaxed">{brandTagline}</p>
          </div>
          {/* Merged STAYMAKOM + Explore links side by side */}
          <div className="pb-4 border-b border-white/15 flex gap-8 justify-center text-left">
            <div>
              <h4 className="font-sans text-xs font-semibold uppercase tracking-wider mb-2 text-slate-50">STAYMAKOM</h4>
              <ul className="space-y-1.5">
                <li><Link to={getLocalizedPath("/gift-card")} className="text-xs text-white/80 hover:text-primary transition-smooth">{giftCardLabel}</Link></li>
                <li><Link to={getLocalizedPath("/partners")} className="text-xs text-white/80 hover:text-primary transition-smooth">{partnerLabel}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans text-xs font-semibold uppercase tracking-wider mb-2 text-slate-50">{exploreLabel}</h4>
              <ul className="space-y-1.5">
                <li><Link to={getLocalizedPath("/category/adventure")} className="text-xs text-white/80 hover:text-primary transition-smooth">{adventureLabel}</Link></li>
                <li><Link to={getLocalizedPath("/category/romantic")} className="text-xs text-white/80 hover:text-primary transition-smooth">{romanticLabel}</Link></li>
              </ul>
            </div>
          </div>
          <div>
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider mb-3 text-slate-50">{joinLabel}</h4>
            <EmailForm className="mb-4 max-w-xs mx-auto" />
            <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-2 text-slate-50">{followLabel}</p>
            <SocialIcons iconSize="h-5 w-5" className="justify-center" />
            <p className="text-xs text-white/60 mt-2 leading-relaxed">{followDesc}</p>
          </div>
        </div>

        {/* ─── Legal bottom ─── */}
        <div className="mt-6 pt-5 border-t border-white/20 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-white/60">
          <Link to={getLocalizedPath("/privacy")} className="hover:text-white transition-smooth">{privacyLabel}</Link>
          <span className="hidden sm:inline">·</span>
          <Link to={getLocalizedPath("/terms")} className="hover:text-white transition-smooth">{termsLabel}</Link>
          <span className="hidden sm:inline">·</span>
          <span>© 2026 STAYMAKOM</span>
        </div>
      </div>
    </footer>
  );
};

export default LaunchFooter;
