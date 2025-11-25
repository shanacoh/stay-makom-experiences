import { useLanguage, getLocalizedField } from "@/hooks/useLanguage";
import DOMPurify from 'dompurify';

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

  // Check if content contains HTML tags
  const isHTML = /<[^>]+>/.test(longCopy);

  return (
    <div>
      <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
        {lang === 'he' ? 'תיאור' : 'Description'}
      </h2>
      {isHTML ? (
        <div 
          className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed prose prose-sm sm:prose-base max-w-none"
          dir={lang === 'he' ? 'rtl' : 'ltr'}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(longCopy) }}
        />
      ) : (
        <p 
          className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-line" 
          dir={lang === 'he' ? 'rtl' : 'ltr'}
        >
          {longCopy}
        </p>
      )}
    </div>
  );
};

export default ExperienceDetails;
