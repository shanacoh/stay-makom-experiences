import { useLanguage } from "@/hooks/useLanguage";

const HowItWorksBanner = () => {
  const { lang } = useLanguage();
  const isRTL = lang === 'he';
  
  const steps = isRTL 
    ? [
        { number: "1", text: "בחר את האווירה" },
        { number: "2", text: "בחר את החוויה" },
        { number: "3", text: "הזמן את המלון" }
      ]
    : [
        { number: "1", text: "Choose your vibe" },
        { number: "2", text: "Pick your experience" },
        { number: "3", text: "Book your hotel" }
      ];

  const createContent = () => (
    <>
      {steps.map((step, index) => (
        <span key={index} className="inline-flex items-center">
          <span className="font-bold text-primary">{step.number}</span>
          <span className="font-medium ml-1.5 mr-6">{step.text}</span>
          {index < steps.length - 1 && (
            <span className="text-primary/60 mr-6">•</span>
          )}
        </span>
      ))}
    </>
  );

  // Repeat the content for seamless loop
  const repeatedContent = Array(8).fill(null).map((_, i) => (
    <span key={i} className="mx-4 sm:mx-6">
      {createContent()}
    </span>
  ));

  return (
    <section 
      className="bg-foreground py-2.5 sm:py-3 overflow-hidden"
      aria-hidden="true"
    >
      <div className={`flex whitespace-nowrap ${isRTL ? 'animate-marquee-rtl' : 'animate-marquee'}`}>
        <div className="flex text-white text-xs sm:text-sm md:text-base tracking-wide uppercase">
          {repeatedContent}
        </div>
        <div className="flex text-white text-xs sm:text-sm md:text-base tracking-wide uppercase">
          {repeatedContent}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksBanner;
