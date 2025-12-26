import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/lib/translations";

const MarqueeBanner = () => {
  const { lang } = useLanguage();
  const isRTL = lang === 'he';
  
  const text = t(lang, 'marqueeBanner');
  
  // Create repeated text for seamless loop
  const repeatedContent = Array(8).fill(text).join(' • ');

  return (
    <section 
      className="bg-[#f5f0e8] py-3 sm:py-4 overflow-hidden"
      aria-hidden="true"
    >
      <div className={`flex whitespace-nowrap ${isRTL ? 'animate-marquee-rtl' : 'animate-marquee'}`}>
        <span className="text-foreground font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase mx-4">
          {repeatedContent}
        </span>
        <span className="text-foreground font-semibold text-xs sm:text-sm tracking-[0.2em] uppercase mx-4">
          {repeatedContent}
        </span>
      </div>
    </section>
  );
};

export default MarqueeBanner;
