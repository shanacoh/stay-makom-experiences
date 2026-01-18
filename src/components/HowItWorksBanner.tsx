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

  return (
    <section 
      className="bg-foreground py-3 sm:py-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-4 sm:gap-8 md:gap-12">
              <span className="inline-flex items-center gap-2">
                <span className="font-bold text-primary text-lg sm:text-xl">{step.number}</span>
                <span className="font-medium text-white text-sm sm:text-base uppercase tracking-wide">{step.text}</span>
              </span>
              {index < steps.length - 1 && (
                <span className="hidden sm:block text-primary/60 text-lg">•</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksBanner;
