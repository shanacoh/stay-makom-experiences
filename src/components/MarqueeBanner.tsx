import { useLanguage } from "@/hooks/useLanguage";

const MarqueeBanner = () => {
  const { lang } = useLanguage();
  const isRTL = lang === 'he';
  
  // Create the formatted text with proper styling
  const createContent = () => (
    <>
      <span className="font-normal">HANDPICKED HOTELS.</span>
      <span className="font-bold"> UNFORGETTABLE EXPERIENCES.</span>
    </>
  );

  // Repeat the content for seamless loop
  const repeatedContent = Array(12).fill(null).map((_, i) => (
    <span key={i} className="mx-8">
      {createContent()}
    </span>
  ));

  return (
    <section 
      className="bg-white py-3 sm:py-4 overflow-hidden"
      aria-hidden="true"
    >
      <div className={`flex whitespace-nowrap ${isRTL ? 'animate-marquee-rtl' : 'animate-marquee'}`}>
        <div className="flex text-foreground text-xs sm:text-sm tracking-[0.05em] uppercase">
          {repeatedContent}
        </div>
        <div className="flex text-foreground text-xs sm:text-sm tracking-[0.05em] uppercase">
          {repeatedContent}
        </div>
      </div>
    </section>
  );
};

export default MarqueeBanner;
