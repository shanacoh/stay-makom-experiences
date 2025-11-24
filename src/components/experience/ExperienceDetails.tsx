import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";

interface ExperienceDetailsProps {
  experience: {
    long_copy?: string | null;
    long_copy_he?: string | null;
  };
}

const ExperienceDetails = ({ experience }: ExperienceDetailsProps) => {
  const { lang } = useLanguage();
  const longCopy = getLocalizedField(experience, 'long_copy', lang) as string | null;
  
  if (!longCopy) return null;

  return (
    <div>
      <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
        {lang === 'he' ? 'מה תעשו' : 'What you\'ll do'}
      </h2>
      <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-line" dir={lang === 'he' ? 'rtl' : 'ltr'}>
        {longCopy}
      </p>
    </div>
  );
};

export default ExperienceDetails;
