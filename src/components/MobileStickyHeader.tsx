import { Link } from "react-router-dom";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { Compass, Heart } from "lucide-react";

const MobileStickyHeader = () => {
  const { getLocalizedPath } = useLocalizedNavigation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-secondary/60 md:hidden">
      {/* Row 1: Logo */}
      <div className="flex justify-center py-2">
        <Link to="/launch" className="font-sans font-bold tracking-[-0.04em] uppercase text-[20px] text-foreground">
          STAYMAKOM
        </Link>
      </div>

      {/* Row 2: Category pills */}
      <div className="flex justify-center gap-2 pb-2.5">
        <Link
          to={getLocalizedPath("/launch/experiences?filter=adventure&context=launch")}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary text-primary text-[12px] font-medium tracking-wide transition-colors hover:bg-primary/5"
        >
          <Compass size={13} strokeWidth={1.5} />
          Feeling Adventurous
        </Link>
        <Link
          to={getLocalizedPath("/launch/experiences?filter=romantic&context=launch")}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary text-primary text-[12px] font-medium tracking-wide transition-colors hover:bg-primary/5"
        >
          <Heart size={13} strokeWidth={1.5} />
          Romantic Escape
        </Link>
      </div>
    </header>
  );
};

export default MobileStickyHeader;
