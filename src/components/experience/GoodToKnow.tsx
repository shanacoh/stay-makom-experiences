interface GoodToKnowProps {
  items?: string[] | null;
}

const GoodToKnow = ({ items }: GoodToKnowProps) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-bold">Good to know</h2>
      <ul className="space-y-2 sm:space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 sm:gap-3">
            <span className="text-primary mt-1 text-base sm:text-lg">•</span>
            <span className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoodToKnow;
