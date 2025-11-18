interface ExperienceDetailsProps {
  longCopy?: string | null;
}

const ExperienceDetails = ({ longCopy }: ExperienceDetailsProps) => {
  if (!longCopy) return null;

  return (
    <div>
      <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">What you'll do</h2>
      <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
        {longCopy}
      </p>
    </div>
  );
};

export default ExperienceDetails;
