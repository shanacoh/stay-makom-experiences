import { useLanguage } from "@/hooks/useLanguage";
const HowItWorksBanner = () => {
  const {
    lang
  } = useLanguage();
  const isRTL = lang === 'he';
  const steps = isRTL ? [{
    number: "1",
    line1: "בחר",
    line2: "את האווירה"
  }, {
    number: "2",
    line1: "בחר",
    line2: "את החוויה"
  }, {
    number: "3",
    line1: "הזמן",
    line2: "את המלון"
  }] : [{
    number: "1",
    line1: "Choose",
    line2: "your vibe"
  }, {
    number: "2",
    line1: "Pick",
    line2: "your experience"
  }, {
    number: "3",
    line1: "Book",
    line2: "your hotel"
  }];
  return <section className="bg-foreground py-2.5 sm:py-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container px-4">
        <div className="flex flex-row items-center justify-center gap-3 sm:gap-8 md:gap-12">
          {steps.map((step, index) => <div key={index} className="flex items-center gap-3 sm:gap-8 md:gap-12">
              <span className="inline-flex items-start sm:items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-2xl text-slate-100">{step.number}</span>
                <span className="font-medium text-white text-[11px] sm:text-base uppercase tracking-wide sm:whitespace-nowrap text-center sm:text-left">
                  {step.line1}<br className="sm:hidden" />{' '}{step.line2}
                </span>
              </span>
              {index < steps.length - 1 && <span className="text-primary/60 text-xs sm:text-lg">•</span>}
            </div>)}
        </div>
      </div>
    </section>;
};
export default HowItWorksBanner;